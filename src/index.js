import Caritat from "caritat";
import { ethers } from 'ethers';

const Election = Caritat.Election;
const meek = Caritat.stv.meek;
const Ballot = Caritat.Ballot;

const profileElm = document.getElementById('profile');
const noProfileElm = document.getElementById('noProfile');
const welcomeElm = document.getElementById('welcome');

const rcvLoaderElm = document.getElementById('rcvLoader');
const rcvContainerElm = document.getElementById('rcvContainer');
const rcvTableElm = document.getElementById('rcvTable');

const seatsToFill = 3;
const snapshotApi = "https://hub.snapshot.org/graphql";
const proposalId = "0x1ab7ef84f6e904582d5b5b921944b5b1a8e36dbff1f1248fde87fef02b046816";
const asCurrent = false;
const currentList = ["1st", "2nd", "3rd"];
const tablePrefix = ``;

let widthScreen = screen.width;
let tr = '';
if (widthScreen <= 400) {
  tr = 'trmobile';
} else {
  tr = 'trdesktop';
}

let snapshotProposalsQuery = await fetch(snapshotApi, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: `
      query Proposals {
        proposal (
          id: "${proposalId}"
        ) {
          title
          choices
          end
          state
        }
      }`,
    })
  });
const {data}= await snapshotProposalsQuery.json();
const title = data.proposal.title;
const candidates = data.proposal.choices;
const end = data.proposal.end;

async function countElectionVotes(proposalId, title, candidates, end) {
  console.log("COUNTING FOR", proposalId);

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
}

async function displayResults(proposalId, title, candidates, end) {
  profileElm.classList = '';
  rcvLoaderElm.innerHTML = `<span style="font-size: 22px;">Fetching Data ...</span>`;
  welcomeElm.innerHTML = `<span style="font-size: 22px;">Ranked Choice Voting Calculator</span>`;
  const results = await countElectionVotes(proposalId, title, candidates, end);
  welcomeElm.innerHTML += `<br></br><span style="font-size: 16px;" class="${tr}">${title.toLowerCase()}</span>`;
  welcomeElm.innerHTML += `<br></br><a rel="noreferrer" target='_blank' href="https://snapshot.org/#/ens.eth/proposal/${proposalId.toLowerCase()}" style="font-size: 15px;">link to snapshot ↗</a>`;
  if (results) {
    for (var i = 0; i < results.details.winners.length; i++) {
      rcvTableElm.innerHTML += `<tr><td><div class="tooltip">${currentList[i]}</div></td><td><span class="${tr}">${results.details.winners[i].toLowerCase()}</span></td></tr>`
    }
  }
  rcvLoaderElm.innerHTML = '';
  rcvContainerElm.classList = '';
  welcomeElm.classList = ``;
}

async function refreshPage() {
  document.getElementById("refreshButton").disabled = true;
  profileElm.classList = '';
  rcvLoaderElm.innerHTML = `<span style="font-size: 22px;">Fetching Data ...</span>`;
  setTimeout(function(){
    displayResults(proposalId, title, candidates, end);
    document.getElementById("refreshButton").disabled = true;
  }, 3*1000);
  setTimeout(function(){
    document.getElementById("refreshButton").disabled = false;
  }, 15*1000);
}

const refreshButton = document.getElementById('refreshButton');
refreshPage();
