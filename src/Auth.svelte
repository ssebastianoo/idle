<script>
    var urlParams = new URLSearchParams(window.location.hash.replace("#", "?"));
    var token = urlParams.get("access_token");

    localStorage.setItem('token', token);

    location.href = '/';
</script>