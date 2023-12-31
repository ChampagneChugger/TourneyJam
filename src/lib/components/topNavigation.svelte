<script lang="ts">
	import Icon from "@iconify/svelte"
	import { goto } from "$app/navigation"
	import { page } from "$app/stores"
	import type { User } from "$lib/types/user"
	import { calculate } from "$lib/actions/calculateLevel"
	import { onMount } from "svelte"
	import { badges as userbadges } from "$lib/utils/badges"
	import dataToPass from "$lib/stores/navigationRefresh"
	import Loading from "$lib/components/others/loading.svelte"
	import { beforeNavigate } from "$app/navigation"
	import Nocontent from "./others/nocontent.svelte"
	import type { User as NavigationUser, Game, Tournament, Tag } from "$lib/types/navigationTypes"

	let user: User
	let userRank: string
	let levelPercentage: string | number = ""
	let update: boolean = false
	let updatebar: boolean = false
	let search: string = ""
	let loading: boolean = false
	let mobilenav: boolean = false

	let users: NavigationUser[] = []
	let games: Game[] = []
	let tournaments: Tournament[] = []
	let tags: Tag[] = []

	$: ({ hash } = $page.url)

	$: ({ user } = $page.data)

	onMount(() => {
		if (user) {
			if (user.level != 60) {
				;({ userRank, levelPercentage } = calculate(user.level, user.xp))
			} else {
				levelPercentage = "MAX"
				userRank = "rainbow"
			}
		}
	})

	beforeNavigate(() => {
		search = ""
		mobilenav = false

		users = []
		games = []
		tags = []
		tournaments = []
	})

	$: if ($dataToPass.refresh) {
		user.level = $dataToPass.level
		user.xp = $dataToPass.xp

		update = true
		updatebar = true

		if (user.level != 60) {
			;({ userRank, levelPercentage } = calculate(user.level, user.xp))
		} else {
			levelPercentage = "MAX"
			userRank = "rainbow"
		}

		$dataToPass.refresh = false

		setTimeout(() => {
			update = false
			updatebar = false
		}, 600)
	}

	async function navigationSearch() {
		loading = true

		if (search != "") {
			const res = await fetch(`/api/navigationSearch?query=${search}`, {
				method: "GET"
			})

			const data = await res.json()

			;({ users, games, tournaments, tags } = data)
		}

		loading = false
	}

	function checkIfJoined(players: any) {
		let exists: boolean = false

		for (let i = 0; i < players.length; i++) {
			if (user?.userId == players[i].id) {
				exists = true
				break
			}
		}

		return exists
	}

	let timer: string | number | NodeJS.Timeout | undefined

	function startTimer() {
		loading = true

		users = []
		games = []
		tags = []
		tournaments = []

		if (search != "") {
			resetTimer()
		}
	}

	function resetTimer() {
		clearTimeout(timer)
		timer = setTimeout(navigationSearch, 800)
	}
</script>

<nav>
	<div class="navleft">
		<a href="/"><img src="/logo.svg" alt="Logo" draggable="false" /></a>
		<a href="/">Home</a>
		<a href="/games">Games</a>
		<a href="/tournaments">Tournaments</a>
		<a href="/leaderboard">Leaderboard</a>
		<a href="/news">News</a>
	</div>
	<div class="navcenter">
		<form>
			<input
				type="text"
				name="search"
				placeholder="Search"
				maxlength="40"
				bind:value={search}
				on:input={startTimer}
			/>
			<Icon icon="material-symbols:search" />
		</form>
		{#if search != ""}
			<div class="navsearchcontent">
				{#if loading}
					<Loading />
				{:else}
					<div class="navsearchboxes">
						<div class="navbox">
							<h1>Users</h1>
							<hr />
							{#if users.length > 0}
								<div class="navboxcontent">
									{#each users as { username, profile_picture, badges }}
										<a href="/profile/{username}">
											<img src={profile_picture} alt={username} />
											{username}
											<div class="navbadges">
												{#if badges.length > 0}
													{#each badges as badge}
														<Icon
															icon={userbadges[badge].icon}
															style="color: {userbadges[badge].color}"
														/>
													{/each}
												{/if}
											</div>
										</a>
									{/each}
								</div>
							{:else}
								<Nocontent missing="users" />
							{/if}
						</div>
						<div class="navbox">
							<h1>Games</h1>
							<hr />
							{#if games.length > 0}
								<div class="navboxcontent">
									{#each games as { id, game_name, game_cover }}
										<a href="/games/{id}">
											<img src={game_cover} alt={game_name} />
											{game_name}
										</a>
									{/each}
								</div>
							{:else}
								<Nocontent missing="games" />
							{/if}
						</div>
						<div class="navbox">
							<h1>Tournaments</h1>
							<hr />
							{#if tournaments.length > 0}
								<div class="navboxcontent">
									{#each tournaments as { id, title, cover_image, authUserId, players }}
										<a href="/tournaments/{id}">
											<img src={cover_image} alt={title} />
											{title}
											{#if authUserId == user?.userId}
												<div class="tournamenttag">Created</div>
											{:else if checkIfJoined(players)}
												<div class="tournamenttag">Joined</div>
											{/if}
										</a>
									{/each}
								</div>
							{:else}
								<Nocontent missing="tournaments" />
							{/if}
						</div>
						<div class="navbox">
							<h1>Tags</h1>
							<hr />
							{#if tags.length > 0}
								<div class="navboxcontent">
									{#each tags as { tag }}
										<a href="/tag/{tag}">
											<p>{tag}</p>
										</a>
									{/each}
								</div>
							{:else}
								<Nocontent missing="tags" />
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
	<div class="pcshow">
		<div class="navright">
			{#if !user}
				<a href="/login" class="login">Login</a>
			{:else}
				<div class="profile">
					<a href={"/profile/" + user.username}>
						<img class="profilepicture" src={user.profile_picture} alt={user.username} />
					</a>
					<div class="pil" class:update>
						<Icon icon="material-symbols:hexagon" class={"rank " + userRank} />
						<span>{user.level}</span>
					</div>
					<div class="xpbar" class:updatebar>
						<span class="xppercentage">
							{levelPercentage}{levelPercentage != "MAX" ? "%" : ""}
						</span>
						<div
							class={"xp " + userRank + "background"}
							style:width={levelPercentage == "MAX" ? "100%" : levelPercentage + "%"}
						/>
					</div>
				</div>
			{/if}
			<hr />
			{#if String(user?.role) == "admin"}
				<button on:click={() => goto("/dashboard")} class="adminaccess"
					><Icon icon="dashicons:admin-tools" /></button
				>
			{/if}
			<button
				id="settings"
				class="settings"
				on:click={() => {
					hash == "#settings" ? goto($page.url.pathname) : goto("#settings")
				}}
			>
				<Icon icon="material-symbols:settings" />
			</button>
		</div>
	</div>
	<div class="mobileshow">
		<div class="navright">
			{#if !user}
				<a href="/login" class="login">Login</a>
			{:else}
				<div class="profile">
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div class="hamburger" on:click={() => (mobilenav = !mobilenav)}>
						<Icon icon="material-symbols:menu" />
					</div>
					<div class="mobileprofile" class:mobilenavin={mobilenav}>
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<div class="closemobile" on:click={() => (mobilenav = !mobilenav)}>
							<Icon icon="material-symbols:close" />
						</div>
						<a href={"/profile/" + user.username}>
							<img class="profilepicture" src={user.profile_picture} alt={user.username} />
						</a>
						<div class="pil" class:update>
							<Icon icon="material-symbols:hexagon" class={"rank " + userRank} />
							<span>{user.level}</span>
						</div>
						<div class="xpbar" class:updatebar>
							<span class="xppercentage">
								{levelPercentage}{levelPercentage != "MAX" ? "%" : ""}
							</span>
							<div
								class={"xp " + userRank + "background"}
								style:width={levelPercentage == "MAX" ? "100%" : levelPercentage + "%"}
							/>
						</div>
						<a href="/profile/{user.username}" class="profilea">Go to profile</a>
					</div>
				</div>
			{/if}
			<hr />
			{#if String(user?.role) == "admin"}
				<button on:click={() => goto("/dashboard")} class="adminaccess"
					><Icon icon="dashicons:admin-tools" /></button
				>
			{/if}
			<button
				id="settings"
				class="settings"
				on:click={() => {
					hash == "#settings" ? goto($page.url.pathname) : goto("#settings")
				}}
			>
				<Icon icon="material-symbols:settings" />
			</button>
		</div>
	</div>
</nav>
