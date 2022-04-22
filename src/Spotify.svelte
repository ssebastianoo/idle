<script>
    import { onMount } from "svelte";
    import { logged } from "./stores";
    import Login from "./Login.svelte";
    import Player from "./Player.svelte";
    
    var urlParams = new URLSearchParams(window.location.hash.replace("#", "?"));
    var token = urlParams.get("access_token");

    if (token) {
        localStorage.setItem("token", token);
        location.href = location.protocol + "//" + location.host + location.pathname;
    }

    let loggedIn = false;
    let error = {
        error: false,
        message: '',
    };

    logged.subscribe((value) => {
        loggedIn = value;
    });

    onMount(async () => {
        if (localStorage.getItem("token")) {
            let res = await fetch("https://api.spotify.com/v1/me", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });

            if (res.status === 200) {
                logged.set(true);
            } else {
                logged.set(false);

                if (localStorage.getItem('shouldBeLogged') === 'true') {
                    alert("couldn't log you in, make sure you're in whitelist (app not released yet)");
                }
                localStorage.removeItem('token');
            }
        }
        localStorage.setItem('shouldBeLogged', false);
    });
</script>

<div class="spotify">
    {#if !loggedIn}
        <Login />
    {:else}
        <Player />
    {/if}
</div>
