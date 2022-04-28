<script>
    import { onMount } from "svelte";
    let searchInput, engine;
    let enginesSelectionOpen = false;

    let engines = {
        google: {
            name: "Google",
            url: "https://www.google.com/search?q=",
            icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/1024px-Google_%22G%22_Logo.svg.png"
        },
        duckduckgo: {
            name: "DuckDuckGo",
            url: "https://duckduckgo.com/?q=",
            icon: "https://duckduckgo.com/assets/icons/meta/DDG-icon_256x256.png"
        },
        bing: {
            name: "Bing",
            url: "https://www.bing.com/search?q=",
            icon: "https://news.thewindowsclub.com/wp-content/uploads/2020/10/Bing-Logo.png"
        }
    };

    if (
        localStorage.getItem("engine") &&
        engines[localStorage.getItem("engine")]
    )
        engine = engines[localStorage.getItem("engine")];
    else engine = engines.google;

    console.log(engine);

    onMount(() => {
        searchInput.addEventListener("keydown", (e) => {
            if (e.keyCode === 13) {
                location.href = engine.url + encodeURIComponent(searchInput.value);
            }
        });
    });

    function openEngineSelection() {
        enginesSelectionOpen = true;
    }

    function closeEngineSelection() {
        enginesSelectionOpen = false;
    }

    function changeEngine(e) {
        engine = engines[e];
        localStorage.setItem("engine", e);
        enginesSelectionOpen = false;
    }
</script>

{#if enginesSelectionOpen}
    <div class="engines-parent" on:click={closeEngineSelection}>
        <div class="engines">
            {#each Object.keys(engines) as engine}
                <div
                    class="engine"
                    on:click|preventDefault={() => {
                        changeEngine(engine);
                    }}
                >
                    <img
                        src={engines[engine].icon}
                        alt={engines[engine].name}
                    />
                    <p>{engines[engine].name}</p>
                </div>
            {/each}
        </div>
    </div>
{/if}

<div class="search">
    <img
        src={engine.icon}
        alt={engine.name}
        on:click|preventDefault={openEngineSelection}
    />
    <input
        bind:this={searchInput}
        type="text"
        placeholder="Search something..."
    />
</div>

<style lang="scss">
    @media (max-height: 647px) and (min-width: 542px) {
        .search {
            display: none !important;
        }
    }

    .engines-parent {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: RGBA(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;

        .engines {
            background-color: var(--color1);
            border-radius: var(--border-radius);

            .engine {
                cursor: pointer;
                padding: 10px;
                display: flex;
                align-items: center;
                width: 50vw;

                &:not(:first-child) {
                    border-top: 1px solid black;
                }

                img {
                    width: 35px;
                    height: 35px;
                    margin-right: 10px;
                }

                &:hover {
                    background-color: RGBA(0, 0, 0, 0.05);
                }
            }
        }
    }

    .search {
        display: flex;
        align-items: center;
        padding: 10px;
        background-color: var(--color1);
        border-radius: var(--border-radius);

        img {
            width: 20px;
            height: 20px;
            margin-right: 10px;
            cursor: pointer;
        }

        input {
            width: 100%;
            padding: 2px;
            background: none;
        }
    }
</style>
