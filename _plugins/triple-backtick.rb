module Jekyll
  class MarkdownConverter
    alias :old_convert :convert
    def convert(content)
      content.gsub!(/(?:^|\n)```(\w*)\n(.*\n)```\n/m) do |text|
        "<script type=\"syntaxhighlighter\" class=\"brush: js\"><![CDATA[#{$2}]]></script>"
      end
      old_convert(content)
    end
  end
end