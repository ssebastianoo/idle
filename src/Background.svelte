<div class="background">
    <img src="./sun.svg" alt="sun" class="sun" />
    <img class="sand" src="./sand.svg" alt="sand" />
</div>

<style lang="scss">
    .background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        overflow: hidden;

        .sun {
            width: 250px;
            position: absolute;
            top: 50px;
            left: 50px;
            transition-duration: .4s;
        }

        .sand {
            width: 100vw;
            position: absolute;
            bottom: 0;
        }
    }

    @media (max-width: 971px) {
        .background {
            .sun {
                width: 200px;
                top: 10px;
                left: 10px;
            }
        }
    }

    @media (max-width: 700px) {
        .background {
            .sand {
                width: 800px;
            }
        }
    }
</style>
