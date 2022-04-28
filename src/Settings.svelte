<script>
    import { editFavorites } from "./stores"; 
    let showSettings = false;
</script>

<div class="settings-icon" on:click={() => {showSettings=true}}>
    <i class="fa-solid fa-pen-to-square" />
</div>

{#if showSettings}
    <div class="settings-parent">
        <div class="settings">
            <div class="setting">
                <p>Edit favorites</p>
                <button on:click|preventDefault={() => {showSettings = false; editFavorites.set(true)}}><i class="fa-solid fa-pen-to-square" /></button>
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
    .settings-icon {
        position: absolute;
        top: 20px;
        right: 27px;
        width: 27px;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--color1);
        padding: 5px;
        border-radius: 10px;
        cursor: pointer;

        i {
            font-size: 25px;
        }
    }

    .settings-parent {
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

        .settings {
            background-color: var(--color1);
            border-radius: var(--border-radius);
            width: 450px;

            .setting {
                padding: 10px;
                display: flex;
                align-items: center;

                &:not(:first-child) {
                    border-top: 1px solid black;
                }

                button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 25px;
                    margin-left: 10px;
                }
            }
        }
    }
</style>
