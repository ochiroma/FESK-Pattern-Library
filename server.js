var express		= require('express'),
    app			= express(),
    port        = process.env.PORT || 3000; // set the port

app.use(express.static(__dirname + '/build'));
app.use('/dist/css', express.static(__dirname + '/node_modules/FESK-Styling/public/css'));

app.listen(port, function() {
    console.log('listening');
});