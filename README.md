# nodejswithmysql
An online MySQL access system with NodeJS express

1. setup: 
install the node interpreter: https://nodejs.org/en/, and then import my project from github. 

2. Run: 
firstly, change the database config to your database, and change the ip and port config.
type in terminal: 
> node sqlServer.js

You may need to add node to path environmental variable before doing this. 

3. make query. 
In browser, navigate to root url ("/"), this will redirect you to "/home" page. Never directly visit "/home" page because the page would not display normally. 
The avaliable tables in the database would be displayed in the table. 
click "Describe tables" to lookup table info. 
click "Lookup data" to lookup table info. type * into column would query all columns
if "insertable" option is enabled in the code, "Insert data" option would be avaliable. 
click "Insert data" to insert a row of data into database. type * in column would insert in all columns. 
