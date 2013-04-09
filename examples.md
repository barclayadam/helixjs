---
layout: default
title: HelixJS - Examples
---

## Examples

{% highlight javascript %}
/**
 * SyntaxHighlighter
 */
function foo()
{
    if (counter <= 10)
        return;
    // it works!
}
{% endhighlight %}


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