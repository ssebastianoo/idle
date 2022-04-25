<script>
    import Clock from "./Clock.svelte";
    import Spotify from "./Spotify.svelte";
    import Search from "./Search.svelte";
    import Background from "./Background.svelte";
</script>

<main>
    <Background />

    <div class="container">
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
