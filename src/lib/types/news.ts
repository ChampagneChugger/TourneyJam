interface Image {
    square_tiny: string,
    screen_tiny: string,
    square_small: string,
    original: string
}

interface Category {
    id: number,
    name: string
}

export interface Articles {
    id: number,
    title: string,
    image: Image,
    deck: string,
    categories: Category[]
}