slightjs (Beta Version)
========

Slightjs used for speed optimization.

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
