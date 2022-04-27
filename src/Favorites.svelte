<script>
    import { onMount } from "svelte";

    let favorites = Array();
    let input, lastPressed;
    let showSaved = false;
    let showDashboard = false;

    onMount(() => {
        if (
            localStorage.getItem("favorites") &&
            JSON.stringify(localStorage.getItem("favorites")).length > 0
        )
            favorites = JSON.parse(localStorage.getItem("favorites"));
    });

    async function addFavorite() {
        if (input.value) {
            let url = input.value;
            if (!url.startsWith("http")) url = `http://${url}`;

            favorites.push({
                id: Date.now(),
                name: "",
                url: url,
                icon: `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=128`,
            });
            localStorage.setItem("favorites", JSON.stringify(favorites));

            input.value = "";

            favorites = favorites; // this refreshes the array loop
        }
    }

    function deleteFavorite(id) {
        favorites = favorites.filter((f) => f.id !== id);
        localStorage.setItem("favorites", JSON.stringify(favorites));
    }

    function save(e) {
        let inputs =
            e.target.parentElement.parentElement.querySelectorAll("input");
        let id = inputs[0].value;
        let name = inputs[1].value;
        let url = inputs[2].value;

        favorites = favorites.map((f) => {
            if (f.id == id) {
                f.name = name;
                f.url = url;
            }
            return f;
        });
        localStorage.setItem("favorites", JSON.stringify(favorites));
        showSaved = true;
        setTimeout(() => {
            showSaved = false;
        }, 500);
    }
</script>

{#if showDashboard}
    <div class="dashboard-parent">
        {#if showSaved}
            <p class="saved">saved!</p>
        {/if}
        <div class="favorites-dashboard">
            <div class="add-favorite">
                <input type="text" placeholder="url" bind:this={input} />
                <button on:click|preventDefault={addFavorite}>+</button>
            </div>
            <div class="items">
                {#each favorites as favorite}
                    <div class="item">
                        <img src={favorite.icon} alt={favorite.name} />
                        <div class="text">
                            <input type="hidden" value={favorite.id} />
                            <input
                                type="text"
                                value={favorite.name}
                                placeholder="name"
                                class="edit-favorite"
                            />
                            <input
                                type="text"
                                value={favorite.url}
                                placeholder="url"
                                class="edit-favorite"
                            />
                            <button
                                on:click|preventDefault={() => {
                                    deleteFavorite(favorite.id);
                                }}><i class="fa-solid fa-trash-can" /></button
                            >
                            <button on:click|preventDefault={save}
                                ><i class="fa-solid fa-floppy-disk" /></button
                            >
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
{/if}
<div class="favorites">
    {#each favorites as favorite}
        <a href={favorite.url}>
            <img src={favorite.icon} alt={favorite.name} />
        </a>
    {/each}
</div>

<style lang="scss">
    img {
        width: 40px;
    }

    .dashboard-parent {
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

        .saved {
            position: absolute;
            background-color: var(--color1);
            color: #809970;
            font-size: 30px;
            padding: 5px;
            border-radius: var(--border-radius);
            box-shadow: 2px 2px 10px black;
        }

        .favorites-dashboard {
            background-color: var(--color1);
            border-radius: var(--border-radius);
            width: 450px;

            .item {
                padding: 10px;
                display: flex;
                align-items: center;

                &:not(:first-child) {
                    border-top: 1px solid black;
                }

                img {
                    width: 35px;
                    height: 35px;
                    margin-right: 10px;
                }

                .text {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;

                    .edit-favorite {
                        width: 130px;
                    }
                }
            }
        }
    }
</style>
