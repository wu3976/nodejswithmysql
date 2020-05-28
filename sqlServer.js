const expMod = require("express");
const sqlMod = require("mysql");
const fsMod = require("fs");
const pathMod = require("path");
const bpMod = require("body-parser");
const utilMod = require("./utility");
/**
 * @author Chenjie Wu
 */
/**
 * Make query to the database, generate HTML page based on the result,
 * and redirect to next request
 * @param query The query string that would be made to sql. STRING
 * @param fileNameWOExt The name of file being written, without extension. STRING
 * @param res The response object of an HTTP request. OBJECT: Response
 * @param msg the message that would appear in HTML. STRING
 */
const processAndRedirect = (query, fileNameWOExt, res, msg)=>{
    sql.query(query, (err, result) => {
        if (err){
            res.redirect("/error?message=invalid_query");
        } else {
            let filePath = pathMod.join(__dirname, "static", fileNameWOExt + ".html");
            console.log(filePath);
            console.log(result);
            if (!Array.isArray(result)){
                var arr = [];
                arr.push(result);
                result = arr;
            }
            utilMod.writeFile(result, filePath, msg);
            res.redirect("/query_result?filename=" + fileNameWOExt + "&type=html");
        }
    });
}

// replace these with your database's config.
const host = "localhost";
const user = "root";
const password = "753951"
const dbname = "hollow_knight";
const port = 3000;
const insertable = true; // allow insertion operation to the database.

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
        console.log(`MySQL connected to database ${dbname}`);
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
            utilMod.writeWelcomePage(dbname, insertable, path, table_arr );
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

server.post("/tempRoute_3", (req, res) => {
    res.redirect("/insert");
});

server.post("/tempRoute_4", (req, res) => {
    res.redirect("/delete");
});

server.get("/describe", (req, res) => {
    res.sendFile(pathMod.join(__dirname, "static", "describeform.html"));
});

server.post("/describe", (req, res) => {
    console.log(req.body);
    let query = `DESCRIBE ${req.body[`tableName`]}`;
    let name = "temp";
    console.log(`query: ${query}`);
    processAndRedirect(query, name, res, `Information of ${req.body['tableName']}:`);
});

server.get("/lookup", (req, res) => {
   res.sendFile(pathMod.join(__dirname, "static", "lookupform.html"));
});

server.post("/lookup", (req, res) => {
    console.log(req.body);
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
    }
    console.log(query);
    processAndRedirect(query, "temp", res, `Data returned from ${req.body["tableName"]}:`);
});

server.get("/insert", (req, res) =>{
    let path = pathMod.join(__dirname, "static", "insertform.html");
    res.sendFile(path);
});

server.post("/insert", (req, res) => {
    console.log(req.body);
    let col_arr = utilMod.parseColumnNames(req.body['columnNames']);
    let val_arr = utilMod.parseColumnNames(req.body['values']);
    let query = `INSERT INTO ${req.body['tableName']}`;
    let value_str = "";
    for (let ele of val_arr){
        value_str += `${ele},`;
    }
    value_str = value_str.substring(0, value_str.length - 1);

    let column_str = "";
    for (let ele of col_arr){
        column_str += `${ele},`;
    }
    column_str = column_str.substring(0, column_str.length - 1);

    if (col_arr.length === 1 && col_arr[0] === "*"){
        query += ` VALUE(${value_str});`
    } else {
        query += `(${column_str}) VALUE(${value_str});`;
    }
    console.log(query);
    processAndRedirect(query, "temp", res, `Query OK.<br>`);
});

server.get("/delete", (req, res) => {
    res.sendFile(pathMod.join(__dirname, "static", "deleteform.html"))
});

server.post("/delete", (req, res) => {
    console.log(req.body);
    let col_Name = req.body['columnName'];
    let value = req.body['valueName'];
    let tableName = req.body['tableName']
    let query = `DELETE FROM ${tableName} WHERE ${col_Name} = ${value};`;
    processAndRedirect(query, "temp", res, `Query OK.<br>`);
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

server.listen(port, ()=>{
    console.log("Server started on port 3000");
});

