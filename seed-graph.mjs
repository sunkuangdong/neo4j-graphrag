/**
 * Seed the bubble tea knowledge graph (English).
 * Run: node seed-graph.mjs
 */
import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
    'bolt://localhost:7687',
    neo4j.auth.basic('neo4j', '12345678'),
);

const STATEMENTS = [
    'MATCH (n) DETACH DELETE n',

    `CREATE (product:Product {name: "Pearl Milk Tea"})
     CREATE (type1:Type {name: "Taiwanese Milk Tea"})
     CREATE (type2:Type {name: "Hong Kong Milk Tea"})`,

    `CREATE (ing1:Ingredient {name: "Tapioca Pearls"})
     CREATE (ing2:Ingredient {name: "Taro Balls"})
     CREATE (ing3:Ingredient {name: "Fructose"})
     CREATE (ing4:Ingredient {name: "Black Tea"})
     CREATE (ing5:Ingredient {name: "Milk"})`,

    `CREATE (method1:Method {name: "Boiling"})
     CREATE (method2:Method {name: "Brewing"})`,

    `CREATE (people1:People {name: "Young Adults"})
     CREATE (people2:People {name: "Students"})
     CREATE (people3:People {name: "Dessert Lovers"})`,

    `MATCH (p:Product {name: "Pearl Milk Tea"}), (t:Type {name: "Taiwanese Milk Tea"})
     CREATE (p)-[:BELONGS_TO]->(t)`,

    `MATCH (p:Product {name: "Pearl Milk Tea"}), (i:Ingredient {name: "Tapioca Pearls"})
     CREATE (p)-[:CONTAINS]->(i)`,

    `MATCH (p:Product {name: "Pearl Milk Tea"}), (i:Ingredient {name: "Fructose"})
     CREATE (p)-[:CONTAINS]->(i)`,

    `MATCH (p:Product {name: "Pearl Milk Tea"}), (i:Ingredient {name: "Black Tea"})
     CREATE (p)-[:CONTAINS]->(i)`,

    `MATCH (p:Product {name: "Pearl Milk Tea"}), (i:Ingredient {name: "Milk"})
     CREATE (p)-[:CONTAINS]->(i)`,

    `MATCH (i:Ingredient {name: "Tapioca Pearls"}), (m:Method {name: "Boiling"})
     CREATE (i)-[:USES]->(m)`,

    `MATCH (p:Product {name: "Pearl Milk Tea"}), (peo:People {name: "Young Adults"})
     CREATE (p)-[:SUITABLE_FOR]->(peo)`,

    `MATCH (p:Product {name: "Pearl Milk Tea"}), (peo:People {name: "Students"})
     CREATE (p)-[:SUITABLE_FOR]->(peo)`,

    `MATCH (p:Product {name: "Pearl Milk Tea"}), (peo:People {name: "Dessert Lovers"})
     CREATE (p)-[:SUITABLE_FOR]->(peo)`,
];

async function main() {
    const session = driver.session();
    try {
        for (const cypher of STATEMENTS) {
            await session.run(cypher);
        }

        const count = await session.run('MATCH (n) RETURN count(n) AS c');
        const ingredients = await session.run(`
            MATCH (p:Product {name: "Pearl Milk Tea"})-[:CONTAINS]->(i)
            RETURN collect(i.name) AS names
        `);

        console.log('Graph seeded successfully.');
        console.log('Node count:', count.records[0].get('c').toNumber());
        console.log('Pearl Milk Tea ingredients:', ingredients.records[0].get('names'));
    } finally {
        await session.close();
    }
}

main()
    .catch(console.error)
    .finally(() => driver.close());
