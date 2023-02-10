<script>
    import Background from "./lib/Background.svelte";
    import Clock from "./lib/Clock.svelte";
    import Spotify from "./lib/Spotify.svelte";
    import Search from "./lib/Search.svelte";
    import Favorites from "./lib/Favorites.svelte";
    import Settings from "./lib/Settings.svelte";
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
            width: 330px;
            margin: 0;
            padding: 0;

            div {
                margin: 20px;
            }
        }
    }

    @media (max-width: 420px) {
        .container {
            width: 250px !important;

            div {
                margin: 20px 0 !important;
            }
        }
    }

    @media (max-height: 647px) and (min-width: 542px) {
        main {
            .container {
                display: flex;
                align-items: center;
                width: unset;

                .favorites,
                .search {
                    display: none;
                }
            }
        }
    }
</style>
