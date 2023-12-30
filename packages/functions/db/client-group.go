package db

import (
	"context"
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	dt "github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

// // A group of related ReplicacheClients. Typically there is one per browser
// // profile.
// type ReplicacheClientGroup = {
//   // Globally unique ID, generated by Replicache.
//   id: string;
//
//   // Optional, but required if the application is authenticated. The userID
//   // that created this ReplicacheClientGroup.
//   userID: any;
// };
//
// // An instance of the Replicache JS class that has ever synced with the server.
// type ReplicacheClient = {
//   // Globally unique ID, generated by Replicache.
//   id: string;
//
//   // The ClientGroup this client is part of.
//   clientGroupID: string;
//
//   // Last mutation the server has processed from this client.
//   lastMutationID: number;
// };

func getDynamoClient() *dynamodb.Client {
    ctx := context.Background()
    cfg, err := config.LoadDefaultConfig(ctx)
    if err != nil {
        log.Fatalf("Could not load config: %v", err)
    }
    client := dynamodb.NewFromConfig(cfg)

    return client
}

type ClientGroupTable struct {
    client *dynamodb.Client
    tableName string
}

func (c *ClientGroupTable) Init() error {
    // FIXME: error handling
    c.client = getDynamoClient()
    c.tableName = os.Getenv("CLIENT_TABLE_NAME")
    if c.tableName == "" {
        return fmt.Errorf("CLIENT_TABLE_NAME not set")
    }
    return nil
}

type Client struct {
    Id string
    LastMutationId int
    changed bool
    new bool
}

func (c *Client) MarkMutationProcessed(mid int) {
    if mid > c.LastMutationId {
        c.changed = true
        c.LastMutationId = mid
    }
}

type ClientGroup struct {
    Id string
    UserId string
    Clients map[string]*Client
}

func NewClientGroup(cgid string, userId string) ClientGroup {
    return ClientGroup{
        Id: cgid,
        UserId: userId,
        Clients: make(map[string]*Client),
    }
}

func (cg *ClientGroup) AddClient(id string) {
    c := Client{
        Id: id,
        LastMutationId: 0,
        changed: true,
        new: true,
    }
    cg.Clients[id] = &c
}

// internal method for adding client, used to construct client
// from dynamodb response
// note does not set changed or new to true
func (cg *ClientGroup) addClient(id string, lastMutationId int) {
    c := Client{
        Id: id,
        LastMutationId: lastMutationId,
        changed: false,
        new: false,
    }
    cg.Clients[id] = &c
} 


type ClientNotFoundError struct { }

func (e ClientNotFoundError) Error() string {
    return "Client not found"
}

func parseClientGroup(items []map[string]dt.AttributeValue) (ClientGroup, error) {
    var err error

    c0 := items[0]
    cgid, ok := c0["ClientGroupId"].(*dt.AttributeValueMemberS)
    if !ok {
        return ClientGroup{}, fmt.Errorf("ClientGroupId not a string")
    }
    userId, ok := c0["UserId"].(*dt.AttributeValueMemberS)
    if !ok {
        return ClientGroup{}, fmt.Errorf("UserId not a string")
    }
    cg := NewClientGroup(cgid.Value, userId.Value)

    for _, item := range items {
        cid, ok := item["ClientId"].(*dt.AttributeValueMemberS)
        if !ok {
            err = fmt.Errorf("ClientId not a string")
            break
        }
        lmidstr, ok := item["LastMutationId"].(*dt.AttributeValueMemberN)
        if !ok {
            err = fmt.Errorf("LastMutationId not a number")
            break
        }
        lmid, err := strconv.Atoi(lmidstr.Value)
        // TODO: check gid & uid match
        if err != nil {
            break
        }
        cg.addClient(cid.Value, lmid)
    }
    return cg, err
}

func (c *ClientGroupTable) GetClientGroup(clientGroupId string) (ClientGroup, error) {
    query := "ClientGroupId = :partitionKeyVal"
    values := map[string]dt.AttributeValue{
        ":partitionKeyVal": dyS(clientGroupId),
    }
    input := dynamodb.QueryInput{
        TableName: &c.tableName,
        KeyConditionExpression: &query,
        ExpressionAttributeValues: values,
        Select: "ALL_ATTRIBUTES",
    }
    resp, err := c.client.Query(context.Background(), &input)
    if err != nil {
        return ClientGroup{}, err
    }
    if len(resp.Items) == 0 {
        return ClientGroup{}, ClientNotFoundError{}
    }

    return parseClientGroup(resp.Items)
}

func (ct *ClientGroupTable) updateClient(cg ClientGroup, c *Client) error {
    // TODO: update ttl timestamp
    values := map[string]dt.AttributeValue{
        "ClientGroupId": dyS(cg.Id),
        "ClientId": dyS(c.Id),
    }
    query := "SET LastMutationId = :lastMutationId";
    input := dynamodb.UpdateItemInput{
        TableName: &ct.tableName,
        Key: values,
        UpdateExpression: &query,
        ExpressionAttributeValues: map[string]dt.AttributeValue{
            ":lastMutationId": dyN(c.LastMutationId),
        },
    }
    _, err := ct.client.UpdateItem(context.Background(), &input)
    if err != nil {
        return err
    }
    return nil
}

func (ct *ClientGroupTable) putClient(cg ClientGroup, c *Client) error {
    values := map[string]dt.AttributeValue{
        "ClientGroupId": dyS(cg.Id),
        "ClientId": dyS(c.Id),
        "LastMutationId": dyN(c.LastMutationId),
        "UserId": dyS(cg.UserId),
    }
    log.Println("putting client", values)
    input := dynamodb.PutItemInput{
        Item: values,
        TableName: &ct.tableName,
    }

    _, err := ct.client.PutItem(context.Background(), &input)
    if err != nil {
        return err
    }
    return nil
}

func (ct *ClientGroupTable) PutClientGroup(cg ClientGroup) error {
    log.Println("putting client group", cg.Id)
    for _, c := range cg.Clients {
        if c == nil {
            log.Printf("client = nil ???", c.Id)
            continue
        }
        if !c.changed {
            // log.Printf("client %v unchanged", c.Id)
            continue
        }
        if c.new {
            // log.Println("creating new client %v", c.Id)
            err := ct.putClient(cg, c)
            if err != nil {
                log.Printf("error creating client: %v", err)
            }
            continue;
        }
        log.Println("updating client %v", c.Id)
        err := ct.updateClient(cg, c)
        if err != nil {
            log.Printf("error updating client: %v", err)
        }
    }
    return nil
}

func dyS(s string) *dt.AttributeValueMemberS {
    return &dt.AttributeValueMemberS{Value: s}
}

func dyN(n int) *dt.AttributeValueMemberN {
    sn := strconv.Itoa(n)
    return &dt.AttributeValueMemberN{Value: sn}
}

