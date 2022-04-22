<script>
    export let name;
    import lyricsSearcher from "lyrics-searcher";

    let lyrics;

    lyricsSearcher(name)
        .then((lyrics) => {
            lyrics = lyrics;
        })
        .catch((error) => {
            console.error(error);
        });
</script>

<div class="lyrics">
    {#if lyrics}
        <p>
            {lyrics}
        </p>
    {/if}
</div>

<style>
    .lyrics {
        position: absolute;
        top: 0;
        left: 0;
        background-color: RGBA(0,0,0,0.5);
    }
</style>
