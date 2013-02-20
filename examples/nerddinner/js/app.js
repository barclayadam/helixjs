hx.config(['$log', '$templating'], 
  function( $log,   $templating) {
        $log.enabled = true;
        $templating.externalPath = '/examples/nerddinner/templates/{name}.html';
  });