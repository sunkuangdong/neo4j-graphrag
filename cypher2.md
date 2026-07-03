# Advanced Cypher examples

## 1. Update product properties

```cypher
MATCH (p:Product {name:"Pearl Milk Tea"})
SET p.calorie = "medium-high", p.taste = "sweet and fragrant"
```

## 2. Update ingredient properties

```cypher
MATCH (i:Ingredient {name:"Tapioca Pearls"})
SET i.origin = "Taiwan", i.texture = "chewy"
```

## 3. Delete a single relationship

```cypher
// Remove: Pearl Milk Tea -SUITABLE_FOR-> Students
MATCH (p:Product {name:"Pearl Milk Tea"})-[r:SUITABLE_FOR]->(s:People {name:"Students"})
DELETE r
```

## 4. Delete a node with no relationships

```cypher
MATCH (t:Type {name:"Hong Kong Milk Tea"})
DELETE t
```

## 5. Delete a node and all its relationships

```cypher
MATCH (i:Ingredient {name:"Taro Balls"})-[r]-()
DELETE r, i
```

## 6. Clear the entire graph (local testing only)

```cypher
MATCH (n) DETACH DELETE n
```
