---
layout: default
title: HelixJS - Examples
---

## Examples (Coming soon)

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
          <li><a href="/dinners/create">Host Dinner</a></li>
          <li class="last"><a href="/about">About</a></li>
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