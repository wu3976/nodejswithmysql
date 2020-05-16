const expMod = require("express");
const sqlMod = require("mysql");
const fsMod = require("fs");
const pathMod = require("path");
const bpMod = require("body-parser");
const utilMod = require("./utility");

const processAndRedirect = (query, fileNameWOExt, res)=>{
    sql.query(query, (err, result) => {
        if (err){
            res.redirect("/error?message=invalid_query");
        } else {
            let filePath = pathMod.join(__dirname, "static", fileNameWOExt + ".html");
            console.log(filePath);
            console.log(result);

            utilMod.writeFile(result, filePath);
            res.redirect("/query_result?filename=" + fileNameWOExt + "&type=html");
        }
    });
}

// replace these with your database's config.
const host = "localhost";
const user = "root";
const password = "753951"
const dbname = "hollow_knight";
const insertable = true; // allow insertion operation.

// creates a connection of mysql database
const sql = sqlMod.createConnection({
    "host" : host,
    "user" : user,
    "password" : password,
    "database" : dbname
});
sql.connect((err) =>{
    if (err){
        throw err;
    } else {
        console.log("MySQL connected");
    }
});
const server = expMod();
server.use(bpMod.urlencoded({extended: false}));

server.get("/createdb", (req, res) => {
    let query1 = "create database nodejsSQL";
    sql.query(query1, (err) => {
        if (err){
            throw err;
        } else {
            res.send("DB created");
        }
    });
});

server.get("/createTable/:name", (req, res) => {
    let newTable = `create table ${req.params.name}` + "(id int primary key, \n" +
        "    name varchar (20), \n" +
        "    GPA int)";
    sql.query(newTable, (err) => {
        if (err){
            throw err;
        }
        console.log(req.params.name + "created!");
        res.send(req.params.name + "created!");
    });
});

server.get("/insertData/:name", (req, res) =>{
    let id = req.query['id'];
    let name = req.query.hasOwnProperty('name') ? req.query['name'] : "null";
    let GPA = req.query.hasOwnProperty('gpa') ? req.query['gpa'] : "null";

    let insertQuery = `insert into ${req.params.name} values(${id}, "${name}", ${GPA})`;
    sql.query(insertQuery, (err) => {
        if (err){
            throw err;
        }
        console.log(`inserted a line in ${req.params.name}: ` + id + ", " + name + ", " + GPA);
        res.send("The line has been inserted: " + `${id}, ${name}, ${GPA}`);
    });
});

//server.use("/public", expMod.static(pathMod.join(__dirname, "static")));
server.get("/select/:tablename/:flag", (req, res) => {
    if (req.params['flag'] === "all"){
        var que = `SELECT * FROM ${req.params["tablename"]}`;
        sql.query(que, (err, result) => {
            if (err){
                console.log(err);
            } else {
                let filePath = pathMod.join(__dirname, "static", `${req.params["tablename"]}${req.params["flag"]}.html`);
                console.log(filePath);
                console.log(result);

                utilMod.writeFile(result, filePath);
                res.redirect("/query_result?filename=table1all&type=html");
            }
        });
    }
});

server.get("/", (req, res) => {
    sql.query("SHOW TABLES;", (err, result) => {
        if (err){
            res.send(err);
        } else {
            console.log(result);
            let table_arr = result.map((obj) => {
                return obj[`Tables_in_${dbname}`];
            });
            console.log(table_arr);
            let fileName = "welcome";
            let path = pathMod.join(__dirname, "static", fileName + ".html");
            utilMod.writeWelcomePage(dbname, insertable, path, table_arr);
            res.redirect("/home?filename=welcome&type=html");
        }
    });
});

server.get("/home", (req, res) => {
    filePath = pathMod.join(__dirname, "static", `${req.query['filename']}.${req.query['type']}`);
    console.log(filePath);
    res.sendFile(filePath);
});

server.post("/tempRoute_1", (req, res) => {
    res.redirect("/describe");
});

server.post("/tempRoute_2", (req, res) => {
    res.redirect("/lookup");
});

server.get("/describe", (req, res) => {
    res.sendFile(pathMod.join(__dirname, "static", "describeform.html"));
});

server.post("/describe", (req, res) => {
    let query = `DESCRIBE ${req.body[`tableName`]}`;
    let name = "temp";

    processAndRedirect(query, name, res);
});

server.get("/lookup", (req, res) => {
   res.sendFile(pathMod.join(__dirname, "static", "lookupform.html"));
});

server.post("/lookup", (req, res) => {
    let tableName = req.body['tableName'];
    let columnNameArray = utilMod.parseColumnNames(req.body['columnNames']);
    var query = `SELECT `;
    if (columnNameArray[0] === "*"){
        query += `* FROM ${tableName};`;
    } else {
        for (ele of columnNameArray){
            query += `${ele},`;
        }
        query = query.substring(0, query.length - 1);
        query += ` FROM ${tableName};`;
        console.log(query);
    }
    processAndRedirect(query, "temp", res);
});

server.get("/query_result", (req, res) =>{
    let filename = req.query['filename'] + "." + req.query['type'];
    let filePath = pathMod.join(__dirname, "static", filename);
    res.sendFile(filePath);
});

server.post("/query_result", (req, res) => {
    res.redirect("/");
});

server.get("/error", (req, res) => {
   if (req.query['message'] === "invalid_query"){
       res.send("There is some problem with your query.");
   }
});

server.listen(3000, ()=>{
    console.log("Server started on port 3000");
});

