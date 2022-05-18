<template>
    <footer class="footer" style="background-color: gold;">
        <div class="container">
            <p class="text-muted">Place sticky footer content here.</p>
        </div>
    </footer>
</template>
<script>
export default{
    name: 'MyFooter'
}
</script>
<style>
footer{
    position: absolute;
    bottom: 0;
    width: 100%;
}
.container .text-muted {
margin: 20px 0;
}
</style>