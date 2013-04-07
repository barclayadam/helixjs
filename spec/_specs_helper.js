if(!document.getElementsByClassName) {

    document.getElementsByClassName = function(className, parentElement) {
      if (typeof parentElement == 'string'){
        parentElement = document.getElementById(parentElement);
      } else if (typeof parentElement != 'object' || typeof parentElement.tagName != 'string') {
        parentElement = document.body;
      }
      debugger
      var children = parentElement.getElementsByTagName('*');
      var re = new RegExp('\\b' + className + '\\b');
      var element, elements = [];
      var i = 0;
      while ( (element = children[i++]) ){
        if ( ellement.className && re.test(element.className)){
          elements.push(element);
        }
      }
      return elements;
    }
}

beforeEach(function () {
    window.sinonSandbox = sinon.sandbox.create(sinon.getConfig({
        injectInto: this,
        useFakeTimers: false
    }));

    hx.get('$bus').clearAll();
    hx.get('$hxBindingsProvider').configure();

    window.sessionStorage.clear();
    window.localStorage.clear();

    this.getFixtureTextContent = function() {
        return document.getElementById(jasmine.getFixtures().containerId).innerText || document.getElementById(jasmine.getFixtures().containerId).textContent;
    };

    this.setHtmlFixture = function (html) {
        setFixtures(html);
    };

    this.applyBindingsToFixture = function (viewModel) {
        ko.applyBindings(viewModel, document.getElementById(jasmine.getFixtures().containerId));
    };

    this.respondWithTemplate = function (path, body) {
        this.server.respondWith("GET", path, [
            200, {
                "Content-Type": "text/html"
            },
            body]);
    };
});

afterEach(function () {
    window.sinonSandbox.restore();
});