# Neo4j Cypher: Bubble Tea Knowledge Graph

## 1. Create nodes

### Products and types

```cypher
CREATE (product:Product {name: "Pearl Milk Tea"})
CREATE (type1:Type {name: "Taiwanese Milk Tea"})
CREATE (type2:Type {name: "Hong Kong Milk Tea"})
```

### Ingredients

```cypher
CREATE (ing1:Ingredient {name: "Tapioca Pearls"})
CREATE (ing2:Ingredient {name: "Taro Balls"})
CREATE (ing3:Ingredient {name: "Fructose"})
CREATE (ing4:Ingredient {name: "Black Tea"})
CREATE (ing5:Ingredient {name: "Milk"})
```

### Methods and target audiences

```cypher
CREATE (method1:Method {name: "Boiling"})
CREATE (method2:Method {name: "Brewing"})

CREATE (people1:People {name: "Young Adults"})
CREATE (people2:People {name: "Students"})
CREATE (people3:People {name: "Dessert Lovers"})
```

## 2. Create relationships

```cypher
// Pearl Milk Tea belongs to Taiwanese Milk Tea
MATCH (p:Product {name: "Pearl Milk Tea"}), (t:Type {name: "Taiwanese Milk Tea"})
CREATE (p)-[:BELONGS_TO]->(t)

// Pearl Milk Tea contains ingredients
MATCH (p:Product {name: "Pearl Milk Tea"}), (i:Ingredient {name: "Tapioca Pearls"})
CREATE (p)-[:CONTAINS]->(i)

MATCH (p:Product {name: "Pearl Milk Tea"}), (i:Ingredient {name: "Fructose"})
CREATE (p)-[:CONTAINS]->(i)

MATCH (p:Product {name: "Pearl Milk Tea"}), (i:Ingredient {name: "Black Tea"})
CREATE (p)-[:CONTAINS]->(i)

MATCH (p:Product {name: "Pearl Milk Tea"}), (i:Ingredient {name: "Milk"})
CREATE (p)-[:CONTAINS]->(i)

// Ingredients use preparation methods
MATCH (i:Ingredient {name: "Tapioca Pearls"}), (m:Method {name: "Boiling"})
CREATE (i)-[:USES]->(m)

// Pearl Milk Tea suitable for audiences
MATCH (p:Product {name: "Pearl Milk Tea"}), (peo:People {name: "Young Adults"})
CREATE (p)-[:SUITABLE_FOR]->(peo)

MATCH (p:Product {name: "Pearl Milk Tea"}), (peo:People {name: "Students"})
CREATE (p)-[:SUITABLE_FOR]->(peo)

MATCH (p:Product {name: "Pearl Milk Tea"}), (peo:People {name: "Dessert Lovers"})
CREATE (p)-[:SUITABLE_FOR]->(peo)
```

## 3. Verify queries

### All nodes and relationships

```cypher
MATCH (n)-[r]->(m)
RETURN n, r, m
```

### Multi-hop queries (GraphRAG)

```cypher
// Pearl Milk Tea → ingredients → preparation method
MATCH (p:Product {name: "Pearl Milk Tea"})-[:CONTAINS]->(i)-[:USES]->(m)
RETURN p.name, i.name, m.name
```

```cypher
// Who is Pearl Milk Tea suitable for?
MATCH (p:Product {name: "Pearl Milk Tea"})-[:SUITABLE_FOR]->(people)
RETURN p.name, people.name
```
