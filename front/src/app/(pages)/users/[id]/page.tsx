import Language from "@/lib/language";
import getUser from "@/lib/user";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function User({ params: { id } }: { params: { id: string } }) {

	const user = await getUser(id);

	if (!user) {

		notFound();

	}

	const performances = await user.performances?.get() || [];

	let maxPerformance = 0, minPerformance = 0, minRating = 0;
	let maxRating = 0, maxInnerPerformance = 0, minInnerPerformance = 0;

	for (const performance of performances) {

		const rating = performance.rating;
		const innerPerformance = performance.innerPerformance;

		maxRating = Math.max(maxRating, rating);
		minRating = Math.min(minRating, rating);
		maxInnerPerformance = Math.max(maxInnerPerformance, innerPerformance);

		maxPerformance = Math.max(maxPerformance, performance.performance);
		minPerformance = Math.min(minPerformance, performance.performance);
		minInnerPerformance = Math.min(minInnerPerformance, performance.innerPerformance);

	}

	const maxShow = Math.max(maxRating, maxInnerPerformance, maxPerformance);
	const minShow = Math.min(minRating, minInnerPerformance, minPerformance);

	const ratings = ["#808080", "#804000", "#008000", "#00C0C0", "#0000FF", "#C0C000", "#FF8000", "#FF0000"];

	function getRatingColor(rating: number) {

		return ratings[Math.min(ratings.length - 1, Math.floor(rating / 400))]

	}

	return (
		<>

			<h1>@{id} | AtsuoCoder</h1>

			<h2><Language>details</Language></h2>

			<table>

				<thead>

					<tr>

						<th><Language>id</Language></th>
						<th><Language>name</Language></th>
						<th><Language>grade</Language></th>
						<th><Language>rating</Language></th>
						<th><Language>highest_rating</Language></th>
						<th><Language>highest_inner_performance</Language></th>

					</tr>

				</thead>

				<tbody>

					<tr>

						<td>{id}</td>
						<td>{(await user.name?.get())?.join(" ")}</td>
						<td>{await user.grade?.get()}</td>
						<td>{await user.rating?.get()} ({await user.inner_rating?.get()})</td>
						<td>{maxRating}</td>
						<td>{maxInnerPerformance}</td>

					</tr>

				</tbody>

			</table>

			<h2><Language>graph</Language></h2>

			{

				performances.length == 0 ?

					<p><Language>no_history</Language></p> :

					<svg width={950} height={500}>

						<rect x={50} y={0} width={900} height={500} stroke="white" strokeWidth={2} fill="none"></rect>

						{
							[0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800, 4000, 4200, 4400, 4600, 4800].map((rating, index) => {

								return (
									<>
										<rect x={50} y={25 + 450 - rating / (maxShow - minShow) * 450} width={900} height={(25 + 450 - rating / (maxShow - minShow) * 450) - (25 + 450 - (rating + 200) / (maxShow - minShow) * 450)} fill={getRatingColor(index * 200 - 200) + "80"}></rect>
										<text x={0} y={25 + 450 - rating / (maxShow - minShow) * 450} key={index} fill="white">{rating}</text>
										<line x1={50} x2={950} y1={25 + 450 - rating / (maxShow - minShow) * 450} y2={25 + 450 - rating / (maxShow - minShow) * 450} stroke="white" strokeWidth={1}></line>
									</>
								);

							})
						}

						{
							performances.map((performance, index) => {

								return (
									index == 0 ?
										<></> :
										<>
											<line x1={(index) * 900 / (performances.length + 1) + 50} x2={(index + 1) * 900 / (performances.length + 1) + 50} y1={25 + 450 - performances[index - 1].rating / (maxShow - minShow) * 450} y2={25 + 450 - performance.rating / (maxShow - minShow) * 450} stroke="white" strokeWidth={1}></line>
											<line x1={(index) * 900 / (performances.length + 1) + 50} x2={(index + 1) * 900 / (performances.length + 1) + 50} y1={25 + 450 - performances[index - 1].innerPerformance / (maxShow - minShow) * 450} y2={25 + 450 - performance.innerPerformance / (maxShow - minShow) * 450} stroke="white" strokeWidth={1}></line>
										</>
								);

							})
						}

						{
							performances.map((performance, index) => {

								return (
									<>
										<Link href={`#history${index}`}><circle cx={(index + 1) * 900 / (performances.length + 1) + 50} cy={25 + 450 - performance.rating / (maxShow - minShow) * 450} r={5} fill={getRatingColor(performance.rating)} stroke="black" strokeWidth={1} key={index * 2}></circle></Link>
										<Link href={`#history${index}`}><circle cx={(index + 1) * 900 / (performances.length + 1) + 50} cy={25 + 450 - performance.innerPerformance / (maxShow - minShow) * 450} r={5} fill={getRatingColor(performance.innerPerformance)} stroke="black" strokeWidth={1} key={index * 2 + 1}></circle></Link>
									</>
								);

							})
						}

					</svg>

			}

			<h2><Language>history</Language></h2>

			<table>

				<thead>

					<tr>

						<th><Language>contest</Language></th>
						<th><Language>performance</Language></th>
						<th><Language>new_rating</Language></th>
						<th><Language>moving</Language></th>

					</tr>

				</thead>

				<tbody>

					{
						performances.map((performance, index) => {

							const moving = performance.rating - (index == 0 ? 0 : performances[index - 1].rating);

							return (
								<tr id={"history" + index} key={index}>

									<td><Link href={"/contests/" + performance.contest}>{performance.contest}</Link></td>
									<td>{performance.performance}</td>
									<td>{performance.rating}</td>
									<td>{(moving > 0 ? "+" : "") + moving}</td>

								</tr>
							);

						})
					}

				</tbody>

			</table>

		</>
	);

}
