import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
    'bolt://localhost:7687',
    neo4j.auth.basic('neo4j', '12345678')
);

const session = driver.session();

async function createData() {
    await session.run(`
        CREATE (p:Product {name:"Pearl Milk Tea"})
        CREATE (i:Ingredient {name:"Tapioca Pearls"})
    `);
    console.log('Nodes created')
}

async function createRelation() {
    await session.run(`
        MATCH (p:Product {name: "Pearl Milk Tea"}), (i:Ingredient {name: "Tapioca Pearls"})
        CREATE (p)-[:CONTAINS]->(i)
    `);
    console.log('Relationship created')
}

async function queryData() {
    const result = await session.run(`
        MATCH (p:Product {name: "Pearl Milk Tea"})-[r]->(i)
        RETURN p, r, i
    `)
    result.records.forEach(record => {
        console.log('Product:', record.get('p').properties.name)
        console.log('Relationship:', record.get('r').type)
        console.log('Ingredient:', record.get('i').properties.name)
        console.log('--------------------------------')
    })
}

async function updateData() {
    await session.run(`
        MATCH (p:Product {name: "Pearl Milk Tea"})
        SET p.price = 15, p.calorie = "medium-high"
    `)
    console.log('Update successful')
}

async function deleteRelation() {
    await session.run(`
      MATCH (p:Product {name: "Pearl Milk Tea"})-[r:CONTAINS]->(i:Ingredient {name: "Tapioca Pearls"})
      DELETE r
    `)
    console.log('Relationship deleted')
}

async function deleteNode() {
    await session.run(`
      MATCH (p:Product {name: "Pearl Milk Tea"})
      DETACH DELETE p
    `)
    console.log('Node deleted')
}

async function main() {
    // await createData();
    // await createRelation();
    // await queryData();
    // await updateData();
    // await deleteRelation();
    // await deleteNode();
}

main()
    .catch(console.error)
    .finally(async () => {
        await session.close();
        await driver.close();
    });
