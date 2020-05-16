const fsMod = require('fs');
/**
 * Some necessary utilities for the main program.
 * @author Chenjie Wu
 */
/**
 * Parse string of column names into an array
 * @param str A string of column names, seperated by comma. STRING
 * @return {[]}
 */
const parseColumnNames = (str) => {
    var result = [];
    let p1 = 0;
    let p2 = 0;
    while (p2 <= str.length){
        if (str.charAt(p2) === ',' || p2 === str.length){
            result.push(str.substring(p1, p2).trim());
            p1 = p2 + 1;
        }
        p2++;
    }
    return result;
}

/**
 * Write the datas from database into an HTML file.
 * @param data An array of data, in which each entry is a struct of column name -> column value
 * representing a row. [Object]
 * @param path The relative path of the output file. STRING
 */
const writeFile = (data, path) => {
    var outputHTML = fsMod.createWriteStream(path);
    outputHTML.write(`<!DOCTYPE html>\n<html lang="en">\n`);
    outputHTML.write(`<head><meta charset="UTF-8"><title>datas</title></head>\n`);
    outputHTML.write(`<body>\n<p>Data Queried:\n<table border = '1'>\n`);
    data = JSON.parse(JSON.stringify(data));
    if (data.length > 0){
        outputHTML.write(`<tr>`);
        for (let i = 0; i < Object.keys(data[0]).length; i++){
            key = Object.keys(data[0])[i];
            outputHTML.write(`<th>${key}</th>`);
        }
        outputHTML.write(`</tr>\n`);
    }
    for (obj of data){
        outputHTML.write(`<tr>`);
        for (ele of Object.keys(obj)){
            outputHTML.write(`<td>${obj[ele]}</td>`);
        }
        outputHTML.write(`</tr>\n`);
    }
    outputHTML.write(`</table>\n<br>\n`);
    outputHTML.write(`<form action="/query_result" method="post"><input type="submit" value="return"></form>`);
    outputHTML.write(`\n</p>\n</body>\n</html>`);
    outputHTML.close();
}

/**
 * print the main page of database access system in HTML
 * @param dbname Name of the database, STRING
 * @param insertable whether print button of insert data, BOOLEAN
 * @param path The absolute path which file would be generated, STRING
 * @param table_arr An array of all tables in database, []
 */
const writeWelcomePage = (dbname, insertable, path, table_arr) => {
    var outputHTML = fsMod.createWriteStream(path);
    outputHTML.write(`<!DOCTYPE html>\n<html lang="en">\n`);
    outputHTML.write(`<head><meta charset="UTF-8"><title>${dbname}</title></head>\n`);
    outputHTML.write(`<body>\n<p>\n<h1>Welcome to database ${dbname}!</h1><br>\n`
        +`tables in databases: ${table_arr.toString()}<br>\n</p>\n<p>\n<span>\n`);
    outputHTML.write(`<form action="/tempRoute_1" method="post">` +
        `<input type="submit" value="Describe tables"></form>\n`);
    outputHTML.write(`<form action="/tempRoute_2" method="post">` +
        `<input type="submit" value="Lookup data"></form>\n`);
    if (insertable){
        outputHTML.write(`<form action="/tempRoute_3" method="post">` +
            `<input type="submit" value="Insert data"></form>\n`);
    }
    outputHTML.write(`</span>\n</p>\n</body>\n</html>`);
}

module.exports = {
    parseColumnNames : parseColumnNames,
    writeFile : writeFile,
    writeWelcomePage : writeWelcomePage
}