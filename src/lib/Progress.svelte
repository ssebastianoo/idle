<script>
    export let duration;
    export let current;

    let progress, point;

    setInterval(() => {
        const r = (current * 100) / duration;
        const pointPixels = (progress.clientWidth * r) / 100;

        if (pointPixels < progress.clientWidth) {
            point.style.width = `${pointPixels}px`;
        }
    }, 1000);
</script>

<div class="progress" bind:this={progress}>
    <div class="point" bind:this={point} />
</div>

<style lang="scss">
    .progress {
        width: 100%;
        background-color: RGBA(0,0,0,0.4);
        border-radius: 1000px;
        position: relative;
        z-index: 999;

        .point {
            height: 10px;
            background-color: #4a452e;
            border-radius: 1000px;
        }
    }
</style>
