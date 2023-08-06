export interface Tournament {
    background_image: string,
    cover_image: string,
    description: string,
    gameId: number,
    id: number,
    host: host,
    max_slots: number,
    prize: number,
    startOn: Date,
    status: string,
    team_size: number,
    title: string,
    type: string
}

interface host {
    username: string,
    profile_picture: string,
    badges: Badges[]
}

enum Badges {
    verified,
    admin,
    company
}