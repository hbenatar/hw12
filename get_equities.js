var http = require('http');
var url = require('url');
var port = process.env.PORT || 3000;
const MongoClient = require('mongodb').MongoClient;
const dburl = "mongodb+srv://hbenatar:helena20@cluster0.z7dctgs.mongodb.net/?retryWrites=true&w=majority";
client = new MongoClient(dburl, { useUnifiedTopology: true });

// connect to database and add get required documents
async function getData(input, field) {
    try {
        await client.connect();
        var dbo = client.db("equities");
        var collection = dbo.collection('equities');
        var data = await collection.find({ [field] : input }).toArray();
        return data;
    }
    catch (err) {
        console.log("Database error: " + err);
    }
    finally {
        client.close();
    }
}

// create server, get input from form, get data from database and print to page
http.createServer(async function (req, res) {
    var obj = url.parse(req.url, true).query;
    var data = await getData(obj.input, obj.name_or_ticker);
    var html = "<html><head><style>body{background-color: #a6bfed;text-align: center;font-family: 'Trebuchet MS';}h2 {color: #2f6fe7;}</style></head>";

    if (data.length === 0)
        html += "<body><h2>The given company name or stock ticker could not be found</h2>";
    else 
        html += "<body><h2>Here are the results for " + obj.input + ":</h2>";

    data.forEach(doc => {
        html += "<p>Company Name: " + doc.company_name + "<br/>";
        html += "Stock Ticker: " + doc.stock_ticker + "</p>";
    });

    html += "</body></html>";

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(html);
    res.end();

}).listen(port);