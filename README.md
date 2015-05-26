slightjs (Beta Version)
========

Slightjs used for speed optimization.

## How to use?

First attach slight.js to your web page. Make sure jquery is already attached before using slight.js (Slight depends on jquery).

**Use the below javascript codes**

Note: make sure you have all the page avilable on your host (Used in the below script example or change according to your application)

```javascript


Slight = new SlightPlugin({
    url:"http://example.com/",
    before: function() {
        // show page loader
        $(".page-loader").css("visibility", "visible");
        
    },
    after: function() {
        // hide page loader
        $(".page-loader").css("visibility", "hidden");
    }
});

Slight.router('index.php', function(){

  // do some action here

});

Slight.router('create.php', function(){

  // do some action here

}).after(function() { 

  // execute some javascript codes
	$("#createUserForm").actionAjax();

 }).before(function(){
 
  // before callback
 
 });
 
 Slight.router('edit.php', function() {}).after(function() { 
 
 // execute some javascript codes
	$("#editUserForm").actionAjax();

 }).scripts(['http://cdn.host.com/some_lib/ver/script.js', 'some_local_script.js']).css(['edit_stylesheet.css']);
 
 
 Slight.notFound(function(){
 
  // take some action on missing route
 
 });

 Slight.router('login.php', function() {}).after(function() {
 
  // execute some javascript after request completed
	$("#userLoginForm").actionAjax();

 });

Slight.router('list.php', function() {

// do some action here

});

// lets start the app
Slight.listen();

```

**HTML Example**

Note: Slight make ajax request to requested page or url. Make sure you have coded you page acc. to it. Avoid loading full layout page.

```html

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
   
    <title>Slight JS Beta Version</title>

    <!-- Bootstrap core CSS -->
    <link href="css/bootstrap.min.css" rel="stylesheet">

    <!-- action ajax -->
    <link href="css/action-ajax.css" rel="stylesheet">
  </head>

  <body>
<!-- Bootstrap Nav Bar -->
   <nav class="navbar navbar-inverse">
  <div class="container">
    <div class="navbar-header">
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="index.php">Slight.js</a>
    </div>
    <div id="navbar" class="collapse navbar-collapse">
      <ul class="nav navbar-nav">
        <li class="active"><a href="index.php" data-role="slight">Home</a></li>
        <li><a href="create.php" data-role="slight">Create</a></li>
        <li><a href="list.php" data-role="slight">List All</a></li>
        <li><a href="login.php" data-role="slight">Login</a></li>
      </ul>
      <ul class="nav navbar-nav navbar-right">
      <!-- attach some ajax loader .gif image as background of .page-loader class -->
        <li><span class="page-loader"></span></li>
      </ul>
    </div><!--/.nav-collapse -->
  </div>
</nav>
    <div class="container">
      <div class="slight-body" id="page-body">

	<!-- slight will load your content here -->

      
        
      </div>

    </div><!-- /.container -->


    <!-- Placed at the end of the document so the pages load faster -->
    <script src="js/jquery.min.js"></script>
    <script src="js/slight.js"></script>
    <script src="js/action-ajax.js"></script>
    <!-- place your slight scrpit codes here -->
    <script src="js/script.js"></script>
  </body>
</html>


```
