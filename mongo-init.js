// MongoDB 初始化脚本
db = db.getSiblingDB('mochiface');

// 创建用户集合
db.createCollection('users');

// 创建用户索引
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });

// 创建图片生成记录集合
db.createCollection('generations');

// 创建生成记录索引
db.generations.createIndex({ "userId": 1 });
db.generations.createIndex({ "createdAt": -1 });

print('MongoDB 数据库初始化完成');
