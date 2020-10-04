
Module.register('MMM-GitHub-Monitor', {
  // Default module config.
  defaults: {
    repositories: [
      {
        owner: 'BrainConverter',
        name: 'MMM-GitHub-Monitor'
      },
    ]
  },

  start: function () {
    Log.log('Starting module: ' + this.name);
    this.scheduleUpdate();
  },

  scheduleUpdate: function () {
    setTimeout(async function () {
      Log.log('Updating repository data');
      await this.updateData();
      this.updateDom();
    }, 1000 * 60 * 2);
  },

  updateData: async function () {
    this.ghData = [];
    for (repo of this.config.repositories) {
      const res = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}`)
      if (res.ok) {
        const json = await res.json();
        this.ghData.push({
          title: `${repo.owner}/${repo.name}`,
          stars: json.stargazers_count,
        })
      }
    }
  },

  // Override dom generator.
  getDom: function () {
    let table = document.createElement('table');

    let head = document.createElement('tr');
    let headName = document.createElement('th');
    headName.innerText = 'Name';
    let headStar = document.createElement('th');
    headStar.innerText = 'Stars';
    head.append(headName);
    head.append(headStar);
    table.append(head);

    this.ghData.forEach(function (repo) {
      let row = document.createElement('tr');

      let title = document.createElement('td');
      title.innerText = repo.title;

      let stars = document.createElement('td');
      stars.innerText = repo.stars;

      row.append(title);
      row.append(stars);
      table.append(row);
    })
    return table;
  }
});