<script>
    import {getColorByOccupancy} from "$lib/actions/getColorByOccupancy.js";
    let { number, outOff } = $props();

	let color = getColorByOccupancy(number, outOff);
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
