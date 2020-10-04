Module.register("MMM-GitHub-Monitor", {
  defaults: {
    updateInterval: 1000 * 60 * 5,
    repositories: [
      {
        owner: 'BrainConverter',
        name: 'MMM-GitHub-Monitor'
      },
    ]
  },

  start: () => {
    Log.log('Starting module: ' + this.name);
    this.update();
    setInterval(this.update, this.config.updateInterval);
  },

  update: async () => {
    this.ghData = [];
    await this.updateData();
    this.updateDom();
  },

  updateData: async () => {
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

  getDom: () => {
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
