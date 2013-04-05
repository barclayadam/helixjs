---
layout: home
title: HelixJS - DNA for web apps
---

## Why HelixJS?

You love the Model-View-ViewModel (MVVM) pattern. You love [Knockout](http://knockoutjs.org) but want to develop in a more structured way to build scalable, maintainable single-page Web apps.

Using [Knockout](http://knockoutjs.org) as a foundation, **HelixJS** offers an opinionated framework for building Web apps. Features include:

- Application semantics - extensions to Knockout binding handlers allows  Web app composition using injectable regions
- Routing engine
- ViewModel lifecycle events
- Application modules, IoC container and dependency injection
- Extensible form validation framework
- Templating engine extensions

## Live Example

{% highlight html %}
<body data-bind="app: true">
  <div class="page">
    <header>
    <div id="title">
      <h1>
        <a href="/" title="Nerd Dinner" class="logo"></a>
      </h1>
    </div>

    <div id="logindisplay">
      [ <a href="/login">Log On</a> ]
    </div>

    <nav>
      <ul id="menu">
        <li><a href="/">Find Dinner</a></li>
        <li><a href="/Dinners/Create">Host Dinner</a></li>
        <li class="last"><a href="/Home/About">About</a></li>
      </ul>
    </nav>
  </header>
  
    <region id="main" class="clearfix"></region>

    <footer>
      Copyright &copy; The HelixJS Team
    </footer>
  </div>
</body>
{% endhighlight %}

## Supported (Tested) Browsers

- IE8+ (Yes, it's time to drop support for IE7 and less)
- Chrome (Latest)
- Firefox (Latest)

Other browsers that match the feature sets of Chrome and Firefox are likely to work as well as the other browsers, they are just not yet fully tested and supported.

## License

Code licensed under the [The MIT License (MIT)](http://www.opensource.org/licenses/mit-license.php).