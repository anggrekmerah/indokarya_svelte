<script>
    // Import the global app styles to be used by the child pages.
    import '../../app.css';

    // A layout file receives a `children` prop which represents the content of the nested page or layout.
    // The `$props()` macro is used to get the props passed to the component.
    let { children } = $props(); 
</script>

{@render children()}