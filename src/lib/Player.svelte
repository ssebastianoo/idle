<script>
    import { onMount } from "svelte";
    import { logged, query, showLyrics } from "./stores";
    import Progress from "./Progress.svelte";
    import Lyrics from "./Lyrics.svelte";

    const token = localStorage.getItem("token");
    let song;
    let currentMs = 0;
    onMount(newSong);

    setInterval(() => {
        newSong();
    }, 1000);

    const fakeSong = {
        fake: true,
        progress_ms: 0,
        item: {
            duration_ms: 0,
            id: 42,
            name: "No song playing",
            external_urls: {
                spotify: "",
            },
            album: {
                name: "No album playing",
                external_urls: {
                    spotify: "",
                },
                images: [
                    {},
                    {
                        url: "./Spotify_Icon_RGB_White.png",
                    },
                ],
            },
            artists: [
                {
                    name: "No artist playing",
                    external_urls: {
                        spotify: "",
                    },
                },
            ],
        },
    };

    async function newSong() {
        var res = await fetch(
            "https://api.spotify.com/v1/me/player/currently-playing",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (res.status !== 200 && res.status !== 204) {
            logged.set(false);
            song = fakeSong;
        } else {
            let data;
            if (res.status === 204) {
                data = fakeSong;
            } else {
                data = await res.json();
            }

            if (data.item) {
                if (song) {
                    if (song.item.id !== data.item.id) {
                        song = data;
                        query.update(
                            (n) =>
                                song.item.name + " " + song.item.artists[0].name
                        );
                    }
                } else {
                    song = data;
                    query.update(
                        (n) => song.item.name + " " + song.item.artists[0].name
                    );
                }

                currentMs = data.progress_ms;
            } else {
                song = fakeSong;
            }
        }
    }

    let lyricsVisible = false;
    showLyrics.subscribe((value) => {
        lyricsVisible = value;
    });

    function checkLyrics(e) {
        if (lyricsVisible) {
            showLyrics.set(false);
            e.target.innerText = 'Show lyrics';
        } else {
            showLyrics.set(true);
            e.target.innerText = 'Hide lyrics';
        }
    }
</script>

<div class="player">
    {#if song}
        <div class="content">
            <img
                src="./Spotify_Icon_RGB_White.png"
                alt="Spotify Icon"
                class="spotify-icon"
            />

            <p class="title">
                <a href={song.item.external_urls.spotify} target="_blank"
                    >{song.item.name}</a
                >
            </p>
            <p class="album">
                <a href={song.item.album.external_urls.spotify} target="_blank"
                    >{song.item.album.name}</a
                >
            </p>
            <p class="artists">
                {#each song.item.artists as artist}
                    <a
                        href={artist.external_urls.spotify}
                        target="_blank"
                        class="artist"
                    >
                        {artist.name}
                    </a>
                {/each}
            </p>
            <p class="time">
                {Math.floor(currentMs / 1000 / 60)}:{(
                    "0" + Math.floor((currentMs / 1000) % 60)
                ).slice(-2)} / {Math.floor(
                    song.item.duration_ms / 1000 / 60
                )}:{(
                    "0" + Math.floor((song.item.duration_ms / 1000) % 60)
                ).slice(-2)}
            </p>
            <Progress duration={song.item.duration_ms} current={currentMs} />
        </div>
        <div class="cover">
            <!-- <Lyrics /> -->
            {#if song.fake}
                <img
                    src={song.item.album.images[1].url}
                    alt="Album Cover"
                    class="fake"
                />
            {:else}
                <a href={song.item.external_urls.spotify} target="_blank">
                    <img
                        src={song.item.album.images[1].url}
                        alt="Album Cover"
                    />
                </a>
            {/if}
            <!-- <button on:click|preventDefault={checkLyrics}>Show lyrics</button> -->
        </div>
    {:else}
        loading...
    {/if}
</div>

<style lang="scss">
    .player {
        background-color: var(--color1);
        padding: 10px 10px;
        padding-bottom: 5px;
        border-radius: var(--border-radius);
        display: inline-block;
        box-shadow: 10px 10px 40px var(--color2);
        transition-duration: 0.4s;
        width: 270px;

        .content {
            margin: 10px;
            position: relative;

            .spotify-icon {
                position: absolute;
                width: 50px;
                right: 0;
                bottom: 20px;
                transition: width 0.4s;
            }

            p {
                margin: 10px 0;
                max-height: 140px;
                overflow-y: auto;
            }

            .title {
                margin-top: 0;
                font-size: 25px;
            }

            .artists,
            .album {
                font-size: 13px;
            }

            .time {
                font-size: 20px;
            }

            .artist:not(:first-child)::before {
                content: " - ";
            }
        }

        .cover {
            position: relative;
            margin: 10px;
            margin-bottom: 0;
            height: 100%;
            img {
                width: 100%;
            }

            :global(button) {
                color: unset;
                background-color: #e8d699;
                border: none;
                cursor: pointer;
                padding: 5px;
                border-radius: 4px;
                width: 100%;
                font-family: unset;

                &:hover {
                    background-color: #f2c18a;
                }
            }
        }
    }

    a {
        text-decoration: none;
        color: unset;

        &:hover {
            text-decoration: underline;
        }
    }

    @media (max-width: 420px) {
        .player {
            width: 230px;
        } 

        .spotify-icon {
            width: 45px !important;
        }
    }

    @media (max-height: 647px) and (min-width: 542px) {
        .player {
            display: flex;
            width: 500px;

            .content {
                width: 50%;
            }

            .cover {
                width: 50%;
                img {
                    width: 100%;
                }
            }
        }

        .spotify-icon {
            bottom: 0;
            left: 0;
            width: 40px !important;
        }
    }
</style>
