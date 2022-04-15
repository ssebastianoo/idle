<script>
    $: clock = new Date();

    let time = new Date();

    $: year = time.getFullYear();
    $: month = {1: 'jan', 2: 'feb', 3: 'mar', 4: 'apr', 5: 'may', 6: 'jun', 7: 'jul', 8: 'aug', 9: 'sep', 10: 'oct', 11: 'nov', 12: 'dec'}[time.getMonth()+1];
    $: weekDay = {1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat', 7: 'sun'}[time.getDay()];
    $: day = time.getDate();
    $: hours = ("0" + time.getHours()).slice(-2);
    $: minutes = ("0" + time.getMinutes()).slice(-2);
    $: seconds = ("0" + time.getSeconds()).slice(-2);

    setInterval(() => {
        time = new Date();
    }, 1000);
</script>

<div class="clock">
    <p class="date">{weekDay}, {day} {month} {year}</p>
    <p class="time">{hours}:{minutes}:{seconds}</p>
</div>

<style lang="scss">
    .clock {
        display: inline-block;
        z-index: 999;

        p {
            margin: 0;
            padding: 0;
            text-align: center;
        }

        .date {
            font-size: 20px;
        }

        .time {
            font-size: 37px;
        }
    }
</style>
