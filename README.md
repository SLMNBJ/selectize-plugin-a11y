# selectize-plugin-a11y.js
Selectize-plugin-a11y is a plugin to make Selectize.js accessible as a Combobox.

## Selectize-plugin-a11y – Usage

```html
<script type="text/javascript" src="selectize.js"></script>
<script type="text/javascript" src="selectize-plugin-a11y.js"></script>
<script>
$(function() {
    let newOptions = Object.assing(options, {
        plugins: ['selectize-plugin-a11y']
    })
	$('select').selectize(options);
});
</script>
```

