export interface DailyMessage {
	id: string;
	category: string;
	text: string;
}

export const DAILY_MESSAGES: ReadonlyArray<DailyMessage> = [
	{ id: 'dm-01', category: 'Persistence', text: 'Every bug you defeat sharpens your blade.' },
	{ id: 'dm-02', category: 'Consistency', text: 'Small commits become powerful journeys.' },
	{ id: 'dm-03', category: 'Debugging', text: 'Do not fear the failing build. Find the weakness.' },
	{ id: 'dm-04', category: 'Growth', text: 'One more problem solved. One more level earned.' },
	{
		id: 'dm-05',
		category: 'Persistence',
		text: 'The strongest developers are not those who never fail, but those who return to the battle.'
	},
	{ id: 'dm-06', category: 'Focus', text: 'A focused mind cuts through any problem.' },
	{ id: 'dm-07', category: 'Focus', text: 'Silence the noise. Let the code speak.' },
	{ id: 'dm-08', category: 'Debugging', text: 'Every stack trace is a map to victory.' },
	{ id: 'dm-09', category: 'Debugging', text: 'The bug is not your enemy. It is your teacher.' },
	{ id: 'dm-10', category: 'Persistence', text: 'One more retry. One more step forward.' },
	{ id: 'dm-11', category: 'Learning', text: 'What confuses you today becomes your strength tomorrow.' },
	{ id: 'dm-12', category: 'Learning', text: 'Every unfamiliar error is a new technique waiting to be learned.' },
	{ id: 'dm-13', category: 'Consistency', text: 'Show up today. The streak remembers.' },
	{ id: 'dm-14', category: 'Consistency', text: 'A little progress each day adds up to great things.' },
	{ id: 'dm-15', category: 'Coding', text: 'Clean code is a quiet kind of power.' },
	{ id: 'dm-16', category: 'Coding', text: 'Write it. Refactor it. Master it.' },
	{ id: 'dm-17', category: 'Failure', text: 'A red build is not the end of the story.' },
	{ id: 'dm-18', category: 'Failure', text: 'Fall seven times. Ship eight.' },
	{ id: 'dm-19', category: 'Growth', text: "Yesterday's bug is today's lesson." },
	{ id: 'dm-20', category: 'Growth', text: 'Every level was once a level you had not reached yet.' }
];
