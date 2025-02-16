<script>
    let { number, outOff } = $props();

	const tenth = outOff / 10;
    let color = Number(number) <= 1 ? 'red' : number <= tenth ? 'orange' : 'green';
</script>

<span><span class="num {color}">{number}</span>/{outOff}</span>

<style>
    span {
        font-weight: 600;
    }

    .red {
        color: var(--color-red);
    }

    .orange {
        color: var(--color-orange);
    }

    .green {
        color: var(--color-green);
    }
</style>
