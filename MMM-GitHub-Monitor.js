Module.register('MMM-GitHub-Monitor', {
  defaults: {
    updateInterval: 1000 * 10,
    repositories: [
      {
        owner: 'BrainConverter',
        name: 'MMM-GitHub-Monitor'
      },
    ]
  },

  getStyles: function() {
    return ['font-awesome.css'];
  },

  start: function () {
    Log.log('Starting module: ' + this.name);
    this.updateCycle();
    setInterval(this.updateCycle, this.config.updateInterval);
  },

  updateCycle: async function () {
    this.ghData = [];
    await this.updateData();
    this.updateDom();
  },

  updateData: async function () {
    for (repo of this.config.repositories) {
      const res = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.name}`)
      if (res.ok) {
        const json = await res.json();
        this.ghData.push({
          title: `${repo.owner}/${repo.name}`,
          stars: json.stargazers_count,
          forks: json.forks_count,
        })
      }
    }
  },

  getDom: function () {
    let table = document.createElement('table');

    this.ghData.forEach(function (repo) {
      let row = document.createElement('tr');

      let title = document.createElement('td');
      title.innerText = repo.title;

      let stars = document.createElement('td');
      stars.innerHTML =  `<i class="fa fa-star"></i> ${repo.stars}`;

      let forks = document.createElement('td');
      forks.innerHTML =  `<i class="fa fa-code-fork"></i> ${repo.forks}`;

      row.append(title);
      row.append(stars);
      row.append(forks)
      table.append(row);
    })
    return table;
  }
});
