<script>
    function makeID(length) {
        var result = "";
        var characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(
                Math.floor(Math.random() * charactersLength)
            );
        }
        return result;
    }

    var client_id = "ad006f6397254bbd9dbe5e6bfbb35407";
    var redirect_uri = location.protocol + "//" + location.host + location.pathname;
    let scope = "user-read-currently-playing";
    var state = makeID(16);
    let loginUrl = "https://accounts.spotify.com/authorize";
    loginUrl += "?response_type=token";
    loginUrl += "&client_id=" + encodeURIComponent(client_id);
    loginUrl += "&scope=" + encodeURIComponent(scope);
    loginUrl += "&redirect_uri=" + encodeURIComponent(redirect_uri);
    loginUrl += "&state=" + encodeURIComponent(state);
</script>

<div class="login">
    <a href={loginUrl}>log in</a>
</div>

<style lang="scss">
    .login {
        width: 100%;
        height: 40px;
        background-color: var(--color1);
        border-radius: var(--border-radius);
        display: flex;
        align-items: center;
        justify-content: center;
        
        a {
            font-size: 20px;
            color: unset;
            text-decoration: none;

            &:hover {
                text-decoration: underline;
            }
        }
    }
</style>
