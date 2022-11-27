import Caritat from "caritat";
import { ethers } from 'ethers';

const Election = Caritat.Election;
const meek = Caritat.stv.meek;
const Ballot = Caritat.Ballot;

const profileElm = document.getElementById('profile');
const noProfileElm = document.getElementById('noProfile');
const welcomeElm = document.getElementById('welcome');
const inputElm = document.getElementById('input');
const seatsElm = document.getElementById('seats');
const spaceElm = document.getElementById('space');
const stateElm = document.getElementById('state');
const animeElm = document.getElementById('anime');
const sankeyElm = document.getElementById('sankey');
const rcvLoaderElm = document.getElementById('rcvLoader');
const rcvContainerElm = document.getElementById('rcvContainer');
const rcvTableElm = document.getElementById('rcvTable');

const snapshotApi = "https://hub.snapshot.org/graphql";
const tablePrefix = ``;

let widthScreen = screen.width;
let canvasWidth = '';
let tr = '';
if (widthScreen <= 400) {
  tr = 'trmobile';
  canvasWidth = '380';
} else {
  tr = 'trdesktop';
  canvasWidth = '600';
}

async function main() {
  animeElm.innerHTML = ``
  sankeyElm.innerHTML = ``
  welcomeElm.innerHTML = ``
  rcvLoaderElm.innerHTML = `<span class="blink_me" style="font-size: 22px; color: orange">Fetching Data ⌛</span>`;
  let optionElm = `<option value="" disabled selected>select state</option>`;
  optionElm += `<option value="active">active</option><br></br>`;
  optionElm += `<option value="closed">closed</option><br></br>`;
  stateElm.innerHTML = `<span style="font-size: 14px; font-weight: 400; font-family: 'SFMono'">status </span><select class="item" id="selectState">${optionElm}</select>`;
  setSpace();
}

async function setSpace() {
  animeElm.innerHTML = ``
  sankeyElm.innerHTML = ``
  rcvLoaderElm.innerHTML = `<span class="blink_me" style="font-size: 22px; color: orange">Fetching Data ⌛</span>`;
  rcvTableElm.innerHTML = ``
  welcomeElm.innerHTML = ``
  let stateId = $('#selectState').find(":selected").val();
  if (stateId) {
    let snapshotProposalsQuery = await fetch(snapshotApi, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `
        query {
          proposals (
            where: {
              type_in: "ranked-choice",
              state: "${stateId}"
            },
          ) {
            space {
              id
            }
          }
        }`,
      })
    });

    const { data } = await snapshotProposalsQuery.json();
    let optionElm = `<option value="" disabled selected>select a space</option>`;
    for (var i = 0; i < data.proposals.length; i++) {
      optionElm += `<option value="${data.proposals[i].space.id}">${data.proposals[i].space.id}</option><br></br>`;
    }
    spaceElm.innerHTML = `<span style="font-size: 14px; font-weight: 400; font-family: 'SFMono'">in space </span><select class="item" id="selectSpace">${optionElm}</select>`;
  }
  rcvLoaderElm.innerHTML = `<span class="blink_me" style="font-size: 22px; color: yellow">↑ Waiting for input ↑</span>`;
}

async function setProposal() {
  animeElm.innerHTML = ``
  sankeyElm.innerHTML = ``
  rcvLoaderElm.innerHTML = `<span class="blink_me" style="font-size: 22px; color: orange">Fetching Data ⌛</span>`;
  rcvTableElm.innerHTML = ``
  welcomeElm.innerHTML = ``
  let stateId = $('#selectState').find(":selected").val();
  let spaceId = $('#selectSpace').find(":selected").val();
  let snapshotProposalsQuery = await fetch(snapshotApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `
      query {
        proposals (
          where: {
            type_in: "ranked-choice",
            state: "${stateId}",
            space_in: "${spaceId}"
          },
        ) {
          id
          title
        }
      }`,
    })
  });

  const { data } = await snapshotProposalsQuery.json();
  let optionElm = `<option value="" disabled selected>select a proposal</option>`;
  for (var i = 0; i < data.proposals.length; i++) {
    optionElm += `<option value="${data.proposals[i].id}">${data.proposals[i].title}</option><br></br>`;
  }
  inputElm.innerHTML = `<span style="font-size: 14px; font-weight: 400; font-family: 'SFMono'">proposal </span><select class="item" id="selectProposal">${optionElm}</select>`;
  rcvLoaderElm.innerHTML = `<span class="blink_me" style="font-size: 22px; color: yellow">↑ Waiting for input ↑</span>`;
}

async function getProposal(proposalId) {
  animeElm.innerHTML = ``
  sankeyElm.innerHTML = ``
  rcvTableElm.innerHTML = ``
  welcomeElm.innerHTML = ``
  let oneProposal = await fetch(snapshotApi, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `
        query {
          proposal (
            id: "${proposalId}"
          ) {
            id
            space {
        		  id
        		}
            title
            choices
            end
            state
          }
        }`,
      })
    });
  const { data } = await oneProposal.json();
  const title = data.proposal.title;
  const candidates = data.proposal.choices;
  const end = data.proposal.end;
  const space = data.proposal.space.id;
  return {
      title,
      candidates,
      end,
      space
    }
}

async function getChoices(proposalId) {
  animeElm.innerHTML = ``
  sankeyElm.innerHTML = ``
  rcvLoaderElm.innerHTML = `<span class="blink_me" style="font-size: 22px; color: orange">Fetching Data ⌛</span>`;
  rcvTableElm.innerHTML = ``
  welcomeElm.innerHTML = ``
  let oneProposal = await fetch(snapshotApi, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `
        query {
          proposal (
            id: "${proposalId}"
          ) {
            choices
          }
        }`,
      })
    });

  const { data } = await oneProposal.json();
  const seats = data.proposal.choices.length;
  return { seats }
}

async function setSeats(){
  animeElm.innerHTML = ``
  sankeyElm.innerHTML = ``
  rcvLoaderElm.innerHTML = `<span class="blink_me" style="font-size: 22px; color: orange">Fetching Data ⌛</span>`;
  let proposalId = $('#selectProposal').find(":selected").val();
  if (proposalId) {
    const { seats } = await getChoices(proposalId);
    let optionElm = `<option value="" disabled selected>select</option>`;
    for (var i = 0; i < seats; i++) {
      optionElm += `<option value="${i + 1}">${i + 1}</option><br></br>`;
    }
    seatsElm.innerHTML = `<span style="font-size: 14px; font-weight: 400; font-family: 'SFMono'">seats to fill </span><select class="item" id="selectSeats">${optionElm}</select>`;
  }
  rcvLoaderElm.innerHTML = `<span class="blink_me" style="font-size: 22px; color: yellow">↑ Waiting for input ↑</span>`;
}

async function countElectionVotes(proposalId, title, candidates, end, space, seatsToFill) {
  const election = new Election({
    minSeats: 0,
  });
  const electionResultsQuery = (
    await fetch(snapshotApi, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `
          query Votes {
              votes (
                first: 10000,
                skip: 0,
                where: {
                  proposal: "${proposalId}"
                },
                orderBy: "created",
                orderDirection: desc
              ) {
                choice
                voter
                vp
              }
            }`,
      }),
    }).then((response) => response.json())
  ).data.votes.map((voter) => ({
    address: voter.voter,
    choice: voter.choice,
    weight: voter.vp,
  }));

  electionResultsQuery.forEach(({ choice, weight }) => {
    const choiceToSend = choice.map((c) => c.toString());
    election.addBallot(new Ballot(choiceToSend, weight));
  });

  const winnersCalculation = meek(election, { seats: seatsToFill });
  const winners = winnersCalculation
    .slice(0, seatsToFill)
    .map((candidate) => candidates[candidate - 1]);
  const _prevStandings =
    winnersCalculation.log[winnersCalculation.log.length - 1].candidates;
  const prevStandings = Object.keys(_prevStandings)
    .map((candidate) => ({
      name: candidates[candidate - 1],
      votes: _prevStandings[candidate].votes,
      status: _prevStandings[candidate].status,
    }))
    .sort((a, b) => b.votes - a.votes);

  return {
    details: {
      proposalId,
      title,
      candidates,
      end,
      winners,
      prevStandings,
    },
    fullLog: winnersCalculation.log,
  }
}

async function showModal() {
  if (document.getElementById("selectAnime").checked === false) {
    showRanking();
  } else {
    sankeyElm.innerHTML = ``
    rcvLoaderElm.innerHTML = `<span class="blink_me" style="font-size: 22px; color: orange">animating ⌛</span>`;
    rcvTableElm.innerHTML = ``
    welcomeElm.innerHTML = ``
    let proposalId = $('#selectProposal').find(":selected").val();
    const { title, candidates, end, space } = await getProposal(proposalId);
    let seatsToFill = $('#selectSeats').find(":selected").val();
    if (seatsToFill) {
      profileElm.classList = '';
      welcomeElm.innerHTML = '';
      const results = await countElectionVotes(proposalId, title, candidates, end, space, Number(seatsToFill));
      welcomeElm.innerHTML += `<h2>${title.toLowerCase()}</h2>`;
      welcomeElm.innerHTML += `<a rel="noreferrer" target='_blank' href="https://snapshot.org/#/${space}/proposal/${proposalId.toLowerCase()}" style="font-size: 15px;">link to snapshot ↗</a>`;
      if (results) {
        rcvTableElm.innerHTML = `<tr><td><div class="tooltip">rank</div></td><td><span style="font-family:'EarthOrbiter'">choice</span></td><td><span style="font-family:'EarthOrbiter'">index</span></td><td><span style="font-family:'EarthOrbiter'">votes</span></td></tr>`
        let currentList = Array.from(Array(Number(seatsToFill)).keys());
        for (var i = 0; i < results.details.winners.length; i++) {
          if (results.details.winners[i]) {
            rcvTableElm.innerHTML += `<tr><td><div class="tooltip">${(currentList[i] + 1).toString()}</div></td><td><span class="${tr}">${results.details.winners[i]}</span></td><td><span class="${tr}">${candidates.indexOf(results.details.winners[i]) + 1}</span></td><td><span class="${tr}">${results.details.prevStandings[i].votes.toString().split(".")[0]}</span></td></tr>`
          }
        }
        // Sankey Flow
        animeElm.innerHTML = `<label class="switch" style="margin-bottom: -15px"><input id="selectAnime" type="checkbox"><div class="slider"></div></label><br></br><span style="font-size: 14px; font-weight: 400; font-family: 'SFMono'">animate</span>`
        document.getElementById("selectAnime").checked = true;
        sankeyDiagram(results.fullLog, candidates, true);
      } else {
        rcvTableElm.innerHTML = `<span style="font-size: 18px; color: orange">❌ no results ❌</span>`;
      }
      rcvLoaderElm.innerHTML = '';
      rcvContainerElm.classList = '';
      welcomeElm.classList = ``;
    }
  }
}

async function showRanking() {
  sankeyElm.innerHTML = ``
  rcvLoaderElm.innerHTML = `<span class="blink_me" style="font-size: 22px; color: orange">processing ⌛</span>`;
  rcvTableElm.innerHTML = ``
  welcomeElm.innerHTML = ``
  let proposalId = $('#selectProposal').find(":selected").val();
  const { title, candidates, end, space } = await getProposal(proposalId);
  let seatsToFill = $('#selectSeats').find(":selected").val();
  if (seatsToFill) {
    profileElm.classList = '';
    welcomeElm.innerHTML = '';
    const results = await countElectionVotes(proposalId, title, candidates, end, space, Number(seatsToFill));
    welcomeElm.innerHTML += `<h2>${title.toLowerCase()}</h2>`;
    welcomeElm.innerHTML += `<a rel="noreferrer" target='_blank' href="https://snapshot.org/#/${space}/proposal/${proposalId.toLowerCase()}" style="font-size: 15px;">link to snapshot ↗</a>`;
    if (results) {
      rcvTableElm.innerHTML = `<tr><td><div class="tooltip">rank</div></td><td><span style="font-family:'EarthOrbiter'">choice</span></td><td><span style="font-family:'EarthOrbiter'">index</span></td><td><span style="font-family:'EarthOrbiter'">votes</span></td></tr>`
      let currentList = Array.from(Array(Number(seatsToFill)).keys());
      for (var i = 0; i < results.details.winners.length; i++) {
        if (results.details.winners[i]) {
          rcvTableElm.innerHTML += `<tr><td><div class="tooltip">${(currentList[i] + 1).toString()}</div></td><td><span class="${tr}">${results.details.winners[i]}</span></td><td><span class="${tr}">${candidates.indexOf(results.details.winners[i]) + 1}</span></td><td><span class="${tr}">${results.details.prevStandings[i].votes.toString().split(".")[0]}</span></td></tr>`
        }
      }
      // Sankey Flow
      animeElm.innerHTML = `<label class="switch" style="margin-bottom: -15px"><input id="selectAnime" type="checkbox"><div class="slider"></div></label><br></br><span style="font-size: 14px; font-weight: 400; font-family: 'SFMono'">animate</span>`
      document.getElementById("selectAnime").checked = false;
      sankeyDiagram(results.fullLog, candidates, false);
    } else {
      rcvTableElm.innerHTML = `<span style="font-size: 18px; color: orange">❌ no results ❌</span>`;
    }
    rcvLoaderElm.innerHTML = '';
    rcvContainerElm.classList = '';
    welcomeElm.classList = ``;
  }
}

async function displayResults() {
  var modal = document.createElement('div');
  let stateId = $('#selectSpace').find(":selected").val();
  let spaceId = $('#selectSpace').find(":selected").val();
  if (stateId && spaceId) {
    await setProposal(spaceId);
  }
}

function sankeyDiagram(data, candidates, anime) {
  sankeyElm.innerHTML = `<svg width="${canvasWidth}" height="250"></svg>`
  sankeyElm.innerHTML += `<canvas width="${canvasWidth}" height="250"></canvas>`
  const nodes = []; const links = [];
  let totalVotes = 0
  for (var i = 0; i < data.length; i++) {
    for (var candidate in data[i].candidates) {
      let scale = 1
      totalVotes = data[i].totalVotes
      // links[]
      if (i < data.length - 1) {
        if (i === 0) {
          if (data[i].electedCount > 1) {
            continue
          }
        }
        if ((data[i].candidates[candidate].status === "elected" && data[i].candidates[candidate].weight === 1) || (data[i].candidates[candidate].status === "eliminated" && data[i].candidates[candidate].votes > 0)) {
          for (var candidate_ in data[i + 1].candidates) {
            if (candidate === candidate_) {
              if (data[i + 1].candidates[candidate_].votes > 0) {
                links.push({"source": `"${i + 1}-${candidate}"`, "target": `"${i + 2}-${candidate_}"`, "type": `"${candidate_}"`, "value": data[i + 1].candidates[candidate_].votes / scale});
              }
            } else {
              if (data[i + 1].candidates[candidate_].votes > 0) {
                links.push({"source": `"${i + 1}-${candidate}"`, "target": `"${i + 2}-${candidate_}"`, "type": `"${candidate_}"`, "value": Math.abs(data[i + 1].candidates[candidate_].votes - data[i].candidates[candidate_].votes)  / scale});
              }
            }
          }
        } else {
          for (var candidate_ in data[i + 1].candidates) {
            if (candidate === candidate_) {
              if (data[i].candidates[candidate].votes > 0) {
                links.push({"source": `"${i + 1}-${candidate}"`, "target": `"${i + 2}-${candidate_}"`, "type": `"${candidate_}"`, "value": data[i].candidates[candidate].votes  / scale});
              }
            }
          }
        }
      }
      // nodes []
      if (data[i].candidates[candidate].weight > 0 || data[i].candidates[candidate].votes > 0) {
        if (i < data.length - 1) {
          nodes.push({"id": `"${i + 1}-${candidate}"`, "title": `${Number(candidate)}↔${candidates[candidate - 1].slice(0,3)}`})
        } else {
          if (data[i].candidates[candidate].status === "elected") {
            nodes.push({"id": `"${i + 1}-${candidate}"`, "title": `${Number(candidate)}↔${candidates[candidate - 1].slice(0,3)} ✅`})
          } else {
            nodes.push({"id": `"${i + 1}-${candidate}"`, "title": `${Number(candidate)}↔${candidates[candidate - 1].slice(0,3)} ❌`})
          }
        }
      }
    }
  }

  if (links.length === 0 || nodes.length === 0) {
    sankeyElm.innerHTML = `<span class="item" style="font-size: 12px; color: white; character-spacing: -0.5px; padding: 5px 10px 10px 5px">⚠️ no graphic to display: winners elected in the very first round ⚠️</span>`
  } else {
    var graph = {
      nodes: nodes,
      links: links
    };

    // Say value measured in t/year, and each dot is 1 kg.
    // So after running for the equivalent of 1 year, we should have seen `1000 *
    // value` dots go by. Assuming they are spread evenly, the interval between
    // adding new dots should be T/(1000*value).
    // Set up SVG
    var svg = d3.select('svg');
    var width = +svg.attr('width');
    var height = +svg.attr('height');
    var margin = { top: 10, left: 70, bottom: 10, right: 0 };

    var layout = d3.sankey()
                   .extent([
                     [margin.left, margin.top],
                     [width - margin.left - margin.right, height - margin.top - margin.bottom]]);

    // Render
    var color = d3.scaleOrdinal(d3.schemeCategory10);
    var diagram = d3.sankeyDiagram()
                    .linkMinWidth(function(d) { return 0.1; })
                    .linkColor(function(d) { return color(d.type); });

    update();

    function update() {
      console.log(layout(graph));

      svg
        .datum(graph)
        .call(diagram);
      /* .transition().duration(1000).ease(d3.easeCubic) */
    }

    var T = 300 * 1000 * (totalVotes / 20); // seconds for a year
    var freqCounter = 1;
    var t = d3.timer(tick, 500);
    var particles = [];
    function tick(elapsed) {
      particles = particles.filter(function (d) {
        return elapsed - d.time < d.duration;
      });
      if (freqCounter > 100) {
        freqCounter = 1;
      }
      graph.links.forEach(d => {
        d.lastNew = d.lastNew || 0;
        if ((elapsed - d.lastNew) > (T / d.value / 1000)) {
          d.lastNew = elapsed;
          var offset = (Math.random() - .5) * d.dy;
          particles.push({
            link: d,
            time: elapsed,
            duration: 1000 * d.points.length,
            offset: offset,
            path: this,
            interp: d3.piecewise(d3.interpolate, d.points),
          })
        }
      })
      /* d3.selectAll(".link").select('path') */
      /* .each( */
      /* function (d) { */
      /* if (40 >= freqCounter) { */
      /* var offset = (Math.random() - .5) * d.dy; */
      /* particles.push({link: d, time: elapsed, offset: offset, path: this}) */
      /* } */
      /* }); */
      if (document.getElementById("selectAnime").checked === true) {
        particleEdgeCanvasPath(elapsed);
      }
      freqCounter++;
      /* console.log(particles) */
    }
  }
  function particleEdgeCanvasPath(elapsed) {
    var context = d3.select("canvas").node().getContext("2d")
    context.clearRect(0,0,1000,1000);
    context.fillStyle = "gray";
    context.lineWidth = "0px";
    context.opacity = "0.5";
    for (var x in particles) {
      var currentTime = elapsed - particles[x].time;
      var currentPercent = currentTime / 1000 / particles[x].link.points.length; //particles[x].duration;
      /* var currentPos = particles[x].path.getPointAtLength(currentPercent) */
      var currentPos = particles[x].interp(currentPercent);
      context.beginPath();
      context.fillStyle = color(particles[x].link.type); //particles[x].link.particleColor(currentTime);
      context.arc(currentPos.x,currentPos.y + particles[x].offset,
                  1, // particles[x].link.particleSize,
                  0,
                  2 * Math.PI);
      context.fill();
    }
  }
}

async function refreshPage() {
  main();
  document.getElementById("refreshButton").disabled = true;
  profileElm.classList = '';
  setTimeout(function(){
    displayResults();
    document.getElementById("refreshButton").disabled = true;
  }, 3*1000);
  setTimeout(function(){
    document.getElementById("refreshButton").disabled = false;
  }, 15*1000);
}

const refreshButton = document.getElementById('refreshButton');
refreshPage();
window.displayResults = displayResults;
window.setSpace = setSpace;
window.setSeats = setSeats;
window.setProposal = setProposal;
window.showRanking = showRanking;
window.showModal = showModal;
