<script>
    import Background from "./Background.svelte";
    import Clock from "./Clock.svelte";
    import Spotify from "./Spotify.svelte";
    import Search from "./Search.svelte";
    import Favorites from "./Favorites.svelte";
    import Settings from "./Settings.svelte";
</script>

<main>
    <Background />
    <Settings />
    <div class="container">
       <div class="favorites">
        <Favorites />
       </div>
        <div class="search">
            <Search />
        </div>
        <div class="clock">
            <Clock />
        </div>
        <div class="spotify">
            <Spotify />
        </div>
    </div>
</main>

<style lang="scss">
    main {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        position: relative;
        
        .container {
            margin: 0;
            padding: 0;

            div {
                margin: 20px;
            }
        }
    }

    @media (max-height: 647px) and (min-width: 542px) {
        main {
            .container {
                display: flex;
                align-items: center;
            }
        }
    }
</style>
