import Caritat from "caritat";
import { ethers } from 'ethers';

const Election = Caritat.Election;
const meek = Caritat.stv.meek;
const Ballot = Caritat.Ballot;

const profileElm = document.getElementById('profile');
const noProfileElm = document.getElementById('noProfile');
const welcomeElm = document.getElementById('welcome');
const inputElm = document.getElementById('input');
const rcvLoaderElm = document.getElementById('rcvLoader');
const rcvContainerElm = document.getElementById('rcvContainer');
const rcvTableElm = document.getElementById('rcvTable');

const seatsToFill = 3;
const snapshotApi = "https://hub.snapshot.org/graphql";
const asCurrent = false;
const currentList = Array.from(Array(seatsToFill).keys());
const tablePrefix = ``;

let widthScreen = screen.width;
let tr = '';
if (widthScreen <= 400) {
  tr = 'trmobile';
} else {
  tr = 'trdesktop';
}

async function main() {
  rcvLoaderElm.innerHTML = `<span class="blink_me" style="font-size: 22px;">Fetching Data ...</span>`;
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
            first: 100,
            skip: 0,
            where: {
              type_in: "ranked-choice",
              state: "active",
            },
            orderBy: "created",
            orderDirection: desc
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

  const { data } = await snapshotProposalsQuery.json();
  let optionElm = `<option value="" disabled selected>select a proposal</option>`;
  for (var i = 0; i < data.proposals.length; i++) {
    optionElm += `<option value="${data.proposals[i].id}">${data.proposals[i].title}</option><br></br>`;
  }
  inputElm.innerHTML = `<select class="item" id="select1">${optionElm}</select>`;
  rcvLoaderElm.innerHTML = `<span class="blink_me" style="font-size: 22px;">Waiting for input ...</span>`;
}

async function getProposal(proposalId) {
  rcvLoaderElm.innerHTML = `<span class="blink_me" style="font-size: 22px;">Fetching Data ...</span>`;
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

async function countElectionVotes(proposalId, title, candidates, end, space) {
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
                first: 1000
                skip: 0
                where: {
                  proposal: "${proposalId}"
                }
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
  try {
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
    };
  } catch (e) {
    return;
  }
}

async function displayResults() {
  let proposalId = $('#select1').find(":selected").val();
  var modal = document.createElement('div');
  if (proposalId) {
    const { title, candidates, end, space } = await getProposal(proposalId);
    profileElm.classList = '';
    welcomeElm.innerHTML = '';
    const results = await countElectionVotes(proposalId, title, candidates, end, space);
    welcomeElm.innerHTML += `<span style="font-size: 16px; font-family: 'Bioliquid'">${title}</span>`;
    welcomeElm.innerHTML += `<br></br><a rel="noreferrer" target='_blank' href="https://snapshot.org/#/${space}/proposal/${proposalId.toLowerCase()}" style="font-size: 15px;">link to snapshot ↗</a>`;
    if (results) {
      rcvTableElm.innerHTML = `<tr><td><div class="tooltip">rank</div></td><td><span style="font-family:'EarthOrbiter'">choice</span></td></tr>`
      for (var i = 0; i < results.details.winners.length; i++) {
        if (results.details.winners[i]) {
          rcvTableElm.innerHTML += `<tr><td><div class="tooltip">${(currentList[i] + 1).toString()}</div></td><td><span class="${tr}">${results.details.winners[i]}</span></td></tr>`
        }
      }
    } else {
      rcvTableElm.innerHTML = `<span style="font-size: 18px; color: orange">❌ no results ❌</span>`;
    }
    rcvLoaderElm.innerHTML = '';
    rcvContainerElm.classList = '';
    welcomeElm.classList = ``;
  } else {
    rcvLoaderElm.innerHTML = `<span class="blink_me" style="font-size: 22px;">Waiting for input ...</span>`;
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
