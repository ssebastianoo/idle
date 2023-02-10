<script>
    import { onMount } from "svelte";
    import { query, showLyrics } from "./stores";

    let lyrics;
    let visibleLyrics;

    query.subscribe(async (value) => {
        const url = encodeURI(
            "https://some-random-api.ml/lyrics?title=" + value
        );
        const res = await fetch(url);
        const json = await res.json();

        if (json.error) lyrics = "No lyrics found";
        else lyrics = json.lyrics.replace(/\n/g, "<br>");
    });

    showLyrics.subscribe((value) => {
        visibleLyrics = value;
    });
</script>

{#if visibleLyrics}
    <div class="lyrics">
        {#if lyrics}
            <p>{@html lyrics}</p>
        {:else}
            <div class="loading" />
        {/if}
    </div>
{/if}

<style lang="scss">
    .lyrics {
        position: absolute;
        margin: 0;
        height: 290px;
        width: 290px;
        background-color: RGBA(242, 218, 138, 1);
        /* background-color: RGBA(0,0,0,0.5); */
        overflow-y: auto;
        padding: 10px;
        transition-duration: 0.4s;
        -ms-overflow-style: none;
        scrollbar-width: none;

        p {
            margin: 0;
        }

        &::-webkit-scrollbar {
            display: none;
        }
    }

    .loading {
        width: 30px;
        height: 30px;
        border: 2px solid var(--color3);
        border-right-color: RGBA(0, 0, 0, 0);
        border-radius: 50%;
        animation: spin 1s infinite;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    @media (max-width: 420px) {
        .lyrics {
            width: 210px;
            height: 210px;
        }
    }

    @media (max-height: 647px) and (min-width: 542px) {
        .lyrics {
            width: 210px;
            height: 210px;
        }
    }
</style>
