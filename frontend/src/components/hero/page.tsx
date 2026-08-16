function Hero(){

    const hero ="https://img.magnific.com/free-vector/orange-background-with-white-circle-word-orange-it_483537-4360.jpg?semt=ais_hybrid&w=740&q=80"
    return(
    <section
        className="h-screen bg-cover bg-center"
        style={{ backgroundImage: `url(${hero})` }}
    >
    </section>
    )
}


export default Hero