if(!document.getElementsByClassName) {
    document.getElementsByClassName = function(className, parentElement) {
        if (typeof parentElement == 'string'){
            parentElement = document.getElementById(parentElement);
        } else if (typeof parentElement != 'object' || typeof parentElement.tagName != 'string') {
            parentElement = document.body;
        }

        var children = parentElement.getElementsByTagName('*');
        var re = new RegExp('\\b' + className + '\\b');
        var element, elements = [];
        var i = 0;

        while ((element = children[i++])) {
            if (element.className && re.test(element.className)) {
                elements.push(element);
            }
        }

        return elements;
    };
}

var fixtureId = 'hx-fixture';

function getFixtureNode() {
    return document.getElementById(fixtureId);
}

function setFixtures(html) {
    var container= document.getElementById(fixtureId);

    if (!container) {
      var container = document.createElement('div');
      container.style.display = "none";
      container.id = fixtureId;

      document.body.appendChild(container);
    }

    container.innerHTML = html;
}

jasmine.slow.enable(); 

beforeEach(function () {
    hx.runConfigBlocks();

    window.sinonSandbox = sinon.sandbox.create(sinon.getConfig({
        injectInto: this,
        useFakeTimers: false
    }));

    hx.get('$bus').clearAll();

    window.sessionStorage.clear();
    window.localStorage.clear();

    this.getFixtureTextContent = function() {
        return getFixtureNode().innerText || getFixtureNode().textContent;
    };

    this.setHtmlFixture = function (html) {
        setFixtures(html);
    };

    this.applyBindingsToFixture = function (viewModel) {
        ko.applyBindings(viewModel, getFixtureNode());
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

    if(getFixtureNode()) {
        ko.cleanNode(getFixtureNode());
    }
});